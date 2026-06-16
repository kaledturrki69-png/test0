from typing import List, Optional
from pydantic import BaseModel, EmailStr


# ---------------------------- Basic Components ---------------------------- #

class SummaryItem(BaseModel):
    status: str
    summary: str


class Degree(BaseModel):
    from_: str
    to: str
    major: str
    degree: str
    status: str


class EducationItem(BaseModel):
    school: str
    location: str
    degrees: List[Degree]


class LanguageItem(BaseModel):
    language: str
    level: str
    status: str


# ---------------------------- Skills Structure ---------------------------- #

class Technology(BaseModel):
    name: str
    status: str
    version: List[str]


class ProfessionalSkill(BaseModel):
    name: str
    status: str


class InterpersonalSkill(BaseModel):
    name: str
    status: str


class SkillsUsed(BaseModel):
    technologies: List[Technology]
    professionalSkills: List[ProfessionalSkill]
    interpersonalSkills: List[InterpersonalSkill]


# ---------------------------- Experience Details -------------------------- #

class Responsibility(BaseModel):
    description: str
    status: str


class TeamInfo(BaseModel):
    managed: Optional[bool] = None
    number: Optional[int] = None


class IssueOrResult(BaseModel):
    # ✅ explicitly structured so schema has "type": "object"
    description: Optional[str] = None
    result: Optional[str] = None
    status: Optional[str] = None


class Position(BaseModel):
    title: str
    from_: str
    to: str
    status: str
    team: Optional[TeamInfo] = None
    skillsUsed: Optional[SkillsUsed] = None
    responsibilities: List[Responsibility]
    # ✅ must have defined "type": "object" items
    issuesAndResults: List[IssueOrResult]


class ExperienceItem(BaseModel):
    company: str
    location: str
    status: str
    positions: List[Position]


# ---------------------------- Certifications ------------------------------ #

class Certification(BaseModel):
    name: str
    status: str
    institution: str
    from_: Optional[str] = None
    to: Optional[str] = None
    # ✅ changed from HttpUrl → str (OpenAI doesn’t accept format=uri)
    url: Optional[str] = None


# ---------------------------- Root Schema -------------------------------- #

class CandidateProfile(BaseModel):
    name: str
    email: EmailStr
    phone: str
    title: str
    summary: List[SummaryItem]
    linkedin: str
    location: str
    mobility: str
    education: List[EducationItem]
    languages: List[LanguageItem]
    experience: List[ExperienceItem]
    certifications: List[Certification]
