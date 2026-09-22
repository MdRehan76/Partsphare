import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import * as usedPartsService from './usedparts.service';
import { successResponse, createdResponse } from '../../utils/response';
import { authenticate } from '../../middleware/auth.middleware';
import { AuthenticatedRequest } from '../../types';
import { uploadUsedPartPhotos } from '../../middleware/upload.middleware';
import AppError from '../../utils/AppError';

const router = Router();

// ============================================================================
// 1. SECURE PHOTO UPLOAD
// ============================================================================
router.post(
  '/upload',
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    uploadUsedPartPhotos.array('photos', 6)(req, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new AppError('File too large. Maximum allowed size is 5MB per photo.', 400));
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return next(new AppError('Too many files. You can upload up to 6 photos per listing.', 400));
          }
          return next(new AppError(`Upload error: ${err.message}`, 400));
        }
        return next(err);
      }
      next();
    });
  },
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const files = (req.files as Express.Multer.File[]) || [];
      if (!files || files.length === 0) {
        throw new AppError('No photo files were provided in upload.', 400);
      }

      const uploaded = files.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: `/uploads/used-parts/${file.filename}`,
      }));

      return createdResponse(res, { files: uploaded }, `${uploaded.length} photo(s) uploaded successfully.`);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================================
// 2. CUSTOMER LISTINGS
// ============================================================================

// Get customer's own listings with status filtering
router.get('/my', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const listings = await usedPartsService.getCustomerListings(
      req.user!.id,
      req.query.status as string | undefined
    );
    return successResponse(res, listings);
  } catch (error) {
    next(error);
  }
});

// Get customer's single listing by ID
router.get('/my/:id', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const listing = await usedPartsService.getCustomerListingById(req.user!.id, req.params.id as string);
    return successResponse(res, listing);
  } catch (error) {
    next(error);
  }
});

// Cancel a customer's submitted / verification pending listing
router.patch('/my/:id/cancel', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const listing = await usedPartsService.cancelCustomerListing(
      req.user!.id,
      req.params.id as string,
      req.body?.reason
    );
    return successResponse(res, listing, 'Used part listing cancelled successfully.');
  } catch (error) {
    next(error);
  }
});

// Create used part listing
router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const listing = await usedPartsService.createUsedPartListing(req.user!.id, req.body);
    return createdResponse(res, listing, 'Used part listing submitted for verification.');
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// 3. PUBLIC MARKETPLACE (VERIFIED & RELISTED PARTS)
// ============================================================================

// List public verified used parts
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await usedPartsService.listVerifiedUsedParts({
      category: req.query.category as string,
      condition: req.query.condition as string,
      search: req.query.search as string,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 12,
    });
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
});

// Get single verified used part by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listing = await usedPartsService.getPublicUsedPartById(req.params.id as string);
    return successResponse(res, listing);
  } catch (error) {
    next(error);
  }
});

export default router;
