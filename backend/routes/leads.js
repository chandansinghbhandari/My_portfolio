/**
 * Lead management API
 *
 * GET    /api/leads           — List all leads (paginated)
 * GET    /api/leads/:id       — Get a single lead
 * PATCH  /api/leads/:id       — Update lead status / notes
 * DELETE /api/leads/:id       — Delete a lead
 * GET    /api/leads/stats     — Conversion stats
 *
 * NOTE: In production, protect these routes with an admin auth middleware.
 *       For now they're open for development convenience.
 */

'use strict';

const express  = require('express');
const { body, query, param } = require('express-validator');

const { Lead }   = require('../lib/models');
const validate   = require('../middleware/validate');

const router = express.Router();

// ── Simple admin guard (swap for real JWT auth in production) ──
function adminGuard(req, res, next) {
  // In production: verify JWT here
  // Example: const token = req.headers.authorization?.split(' ')[1];
  // For development, allow all requests
  if (process.env.NODE_ENV === 'production') {
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
  }
  next();
}

// ── GET /api/leads/stats ───────────────────────────────────────
router.get('/stats', adminGuard, async (req, res, next) => {
  try {
    const [total, byStatus, byBudget, recent] = await Promise.all([
      Lead.countDocuments(),
      Lead.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Lead.aggregate([
        { $group: { _id: '$budget', count: { $sum: 1 } } }
      ]),
      Lead.find().sort({ createdAt: -1 }).limit(5)
        .select('name email budget status createdAt')
        .lean()
    ]);

    // Build status map
    const statusMap = { new: 0, contacted: 0, qualified: 0, converted: 0, lost: 0 };
    byStatus.forEach(s => { statusMap[s._id] = s.count; });

    const budgetMap = {};
    byBudget.forEach(b => { budgetMap[b._id || 'unspecified'] = b.count; });

    res.json({
      success: true,
      stats: {
        total,
        byStatus:  statusMap,
        byBudget:  budgetMap,
        recentLeads: recent,
        conversionRate: total > 0
          ? ((statusMap.converted / total) * 100).toFixed(1) + '%'
          : '0%'
      }
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/leads ─────────────────────────────────────────────
router.get(
  '/',
  adminGuard,
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('status').optional().isIn(['new','contacted','qualified','converted','lost','']),
    query('budget').optional().isIn(['starter','growth','enterprise','']),
    query('search').optional().trim().escape()
  ],
  validate,
  async (req, res, next) => {
    try {
      const page   = req.query.page  || 1;
      const limit  = req.query.limit || 20;
      const skip   = (page - 1) * limit;

      // Build filter
      const filter = {};
      if (req.query.status) filter.status = req.query.status;
      if (req.query.budget) filter.budget = req.query.budget;
      if (req.query.search) {
        filter.$or = [
          { name:  { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } }
        ];
      }

      const [leads, total] = await Promise.all([
        Lead.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Lead.countDocuments(filter)
      ]);

      res.json({
        success: true,
        leads,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (err) {
      next(err);
    }
  }
);

// ── GET /api/leads/:id ─────────────────────────────────────────
router.get(
  '/:id',
  adminGuard,
  [param('id').isMongoId().withMessage('Invalid lead ID')],
  validate,
  async (req, res, next) => {
    try {
      const lead = await Lead.findById(req.params.id).lean();
      if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
      res.json({ success: true, lead });
    } catch (err) {
      next(err);
    }
  }
);

// ── PATCH /api/leads/:id ───────────────────────────────────────
router.patch(
  '/:id',
  adminGuard,
  [
    param('id').isMongoId().withMessage('Invalid lead ID'),
    body('status').optional().isIn(['new','contacted','qualified','converted','lost']),
    body('notes').optional().trim().isLength({ max: 2000 })
  ],
  validate,
  async (req, res, next) => {
    try {
      const { status, notes } = req.body;
      const update = {};
      if (status !== undefined) update.status = status;
      if (notes  !== undefined) update.notes  = notes;

      const lead = await Lead.findByIdAndUpdate(
        req.params.id,
        { $set: update },
        { new: true, runValidators: true }
      ).lean();

      if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
      res.json({ success: true, lead });
    } catch (err) {
      next(err);
    }
  }
);

// ── DELETE /api/leads/:id ──────────────────────────────────────
router.delete(
  '/:id',
  adminGuard,
  [param('id').isMongoId().withMessage('Invalid lead ID')],
  validate,
  async (req, res, next) => {
    try {
      const lead = await Lead.findByIdAndDelete(req.params.id);
      if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
      res.json({ success: true, message: 'Lead deleted' });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;