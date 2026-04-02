from pydantic import BaseModel
from typing import List


class BadgeBase(BaseModel):
    emoji: str
    label: str
    earned: bool


class Badge(BadgeBase):
    id: int

    class Config:
        orm_mode = True


class UserBase(BaseModel):
    name: str
    email: str
    level: str
    point: int
    streak: int
    badge: str
    join_date: str


class User(UserBase):
    id: int

    class Config:
        orm_mode = True


class UserResponse(BaseModel):
    user: User
    badges: List[Badge]
