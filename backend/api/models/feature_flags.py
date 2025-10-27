"""
Feature Flags Models
Pydantic models for feature flags API
"""

from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field


class FeatureFlag(BaseModel):
    """Feature flag model"""
    id: int
    flag_key: str
    flag_name: str
    description: Optional[str] = None
    is_enabled: bool
    rollout_percentage: int = 100
    targeting_rules: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class FeatureFlagCreate(BaseModel):
    """Create feature flag request"""
    flag_key: str = Field(..., min_length=1, max_length=100)
    flag_name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    is_enabled: bool = False
    rollout_percentage: int = Field(default=100, ge=0, le=100)
    targeting_rules: Dict[str, Any] = Field(default_factory=dict)
    notes: Optional[str] = None


class FeatureFlagUpdate(BaseModel):
    """Update feature flag request"""
    flag_name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    is_enabled: Optional[bool] = None
    rollout_percentage: Optional[int] = Field(None, ge=0, le=100)
    targeting_rules: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None


class FeatureFlagStatus(BaseModel):
    """Feature flag status for a user"""
    flag_key: str
    is_enabled: bool
    rollout_percentage: int
    user_included: bool


class FeatureFlagsResponse(BaseModel):
    """Multiple feature flags response"""
    flags: List[FeatureFlag]
    total: int


class UserFeatureFlagsResponse(BaseModel):
    """User-specific feature flags response"""
    user_id: Optional[int] = None
    enabled_flags: List[str]
    all_flags: Dict[str, bool]
