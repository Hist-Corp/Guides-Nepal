from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.roles import TRAVELER
from app.models.booking import Booking, BookingStatus
from app.models.review import Review
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewUpdate, ReviewResponse, CanReviewResponse

router = APIRouter()


def _require_traveler(current_user: User) -> User:
    if current_user.role != TRAVELER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only travellers can leave reviews.",
        )
    return current_user


@router.get("/", response_model=List[ReviewResponse])
def list_reviews(
    experience_id: int = Query(..., description="Experience to list reviews for."),
    db: Session = Depends(get_db),
) -> List[Review]:
    """Public: list all reviews for an experience (newest first)."""
    return (
        db.query(Review)
        .options(joinedload(Review.user))
        .filter(Review.experience_id == experience_id)
        .order_by(Review.created_at.desc())
        .all()
    )


@router.get("/me", response_model=List[ReviewResponse])
def my_reviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[Review]:
    """Reviews left by the currently authenticated traveller."""
    _require_traveler(current_user)
    return (
        db.query(Review)
        .filter(Review.user_id == current_user.id)
        .order_by(Review.created_at.desc())
        .all()
    )


@router.get("/can-review", response_model=CanReviewResponse)
def can_review(
    experience_id: int = Query(..., description="Experience to check eligibility for."),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CanReviewResponse:
    """Tell the frontend whether the current traveller may review an experience.

    A traveller may review an experience only when they have at least one
    completed booking for it and have not already left a review.
    """
    _require_traveler(current_user)

    has_completed_booking = (
        db.query(Booking)
        .filter(
            Booking.user_id == current_user.id,
            Booking.experience_id == experience_id,
            Booking.status == BookingStatus.completed,
        )
        .first()
    )
    if not has_completed_booking:
        return CanReviewResponse(
            can_review=False,
            reason="You can only review experiences you have taken.",
        )

    already_reviewed = (
        db.query(Review)
        .filter(
            Review.user_id == current_user.id,
            Review.experience_id == experience_id,
        )
        .first()
    )
    if already_reviewed:
        return CanReviewResponse(
            can_review=False,
            reason="You have already reviewed this experience.",
        )

    return CanReviewResponse(can_review=True)


@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Review:
    """Leave a review for an experience.

    Restricted to travellers who have a completed booking for the experience
    and who have not already reviewed it.
    """
    _require_traveler(current_user)

    has_completed_booking = (
        db.query(Booking)
        .filter(
            Booking.user_id == current_user.id,
            Booking.experience_id == payload.experience_id,
            Booking.status == BookingStatus.completed,
        )
        .first()
    )
    if not has_completed_booking:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only review experiences you have taken.",
        )

    already_reviewed = (
        db.query(Review)
        .filter(
            Review.user_id == current_user.id,
            Review.experience_id == payload.experience_id,
        )
        .first()
    )
    if already_reviewed:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already reviewed this experience.",
        )

    review = Review(
        experience_id=payload.experience_id,
        user_id=current_user.id,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.put("/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: int,
    payload: ReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Review:
    """Edit your own review."""
    _require_traveler(current_user)

    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    if review.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own reviews.",
        )

    if payload.rating is not None:
        review.rating = payload.rating
    if payload.comment is not None:
        review.comment = payload.comment
    db.commit()
    db.refresh(review)
    return review


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete your own review."""
    _require_traveler(current_user)

    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    if review.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own reviews.",
        )

    db.delete(review)
    db.commit()
    return None
