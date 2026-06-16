# Django Backend — Complete API Implementation Plan

> **Base URL:** `https://brain.jekjob.com` | **API Version Prefix:** `/api/v1/`
> **Auth:** JWT (SimpleJWT) — Bearer token on all protected endpoints
> **Frontend stack:** Next.js 14 App Router proxying all calls to this Django backend

---

## Architecture Overview

```
Frontend (Next.js)
   └── /api/[domain]/route.ts  (proxy layer)
          └──►  Django REST Framework  (brain.jekjob.com)
                    ├── accounts app
                    ├── auth app (SimpleJWT)
                    ├── candidates app
                    ├── positions app
                    ├── assessment app
                    ├── matching app
                    ├── workflow app
                    ├── dashboard app
                    └── documents app
```

---

## 1. 🔐 Authentication — `api/v1/auth/`

### Endpoints Required

| Method | URL | Description | Request Body |
|--------|-----|-------------|--------------|
| `POST` | `/api/v1/auth/token/` | Login — get access + refresh tokens | `{ email, password }` |
| `POST` | `/api/v1/auth/token/refresh/` | Refresh access token | `{ refresh }` |
| `POST` | `/api/v1/auth/token/verify/` | Verify token validity | `{ token }` |
| `POST` | `/api/v1/auth/register/` | Register new user | `{ email, password, role }` |
| `POST` | `/api/v1/auth/forgot-password/` | Request password reset | `{ email }` |
| `POST` | `/api/v1/auth/reset-password/` | Reset password with token | `{ token, new_password }` |

### JWT Token Payload (critical — frontend decodes it directly)

```json
{
  "user_id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "exp": 1234567890
}
```

> [!IMPORTANT]
> The frontend decodes the JWT token directly using `atob(token.split('.')[1])` and reads: `user_id`, `email`, `first_name`, `last_name`. These fields MUST be present in the token payload. Use a custom `TokenObtainPairSerializer` to inject them.

### User Model
```python
class User(AbstractUser):
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=50, default='candidate')
    company = models.ForeignKey('accounts.Company', null=True, on_delete=models.SET_NULL)
    USERNAME_FIELD = 'email'
```

### Registration Response
```json
{ "user": { "id": 1, "email": "...", "role": "candidate" } }
```

---

## 2. 🏢 Accounts — `api/v1/accounts/`

### Endpoints Required

| Method | URL | Description |
|--------|-----|-------------|
| `GET` | `/api/v1/accounts/workplaces/` | List all workplaces |
| `POST` | `/api/v1/accounts/workplaces/` | Create a workplace |
| `GET` | `/api/v1/accounts/workplaces/{id}/` | Get single workplace |
| `PUT` | `/api/v1/accounts/workplaces/{id}/` | Full update |
| `PATCH` | `/api/v1/accounts/workplaces/{id}/` | Partial update |
| `DELETE` | `/api/v1/accounts/workplaces/{id}/` | Delete workplace |

### Workplace Model
```python
class Workplace(models.Model):
    company = models.ForeignKey('Company', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    address_line1 = models.CharField(max_length=255, blank=True)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### Workplace Response
```json
{
  "id": 1,
  "name": "Head Office",
  "address_line1": "123 Main St",
  "company": 1,
  "created_at": "2025-01-01T00:00:00Z"
}
```

---

## 3. 📄 Documents — `api/v1/documents/`

### Endpoints Required

| Method | URL | Description | Notes |
|--------|-----|-------------|-------|
| `GET` | `/api/v1/documents/` | List documents | Supports `page`, `page_size`, `limit`, `offset`, `search` |
| `POST` | `/api/v1/documents/` | Upload document | **Multipart stream upload** |
| `GET` | `/api/v1/documents/{id}/` | Get single document | — |
| `PUT` | `/api/v1/documents/{id}/` | Update document metadata | — |
| `DELETE` | `/api/v1/documents/{id}/` | Delete document | Returns 204 |
| `GET` | `/api/v1/documents/{id}/download/` | Download file | Returns file bytes |

### Document Model
```python
class Document(models.Model):
    DOC_TYPE_CHOICES = [('pdf','pdf'),('word','word'),('doc','doc'),('docx','docx'),('txt','txt'),('unknown','unknown')]
    SOURCE_CHOICES = [('upload','upload'),('app','app'),('email','email'),('web_app','web_app'),('mobile_app','mobile_app'),('phone_app','phone_app')]
    STATUS_CHOICES = [('pending','pending'),('processing','processing'),('completed','completed'),('failed','failed')]

    company = models.ForeignKey('accounts.Company', on_delete=models.CASCADE)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    candidate = models.ForeignKey('candidates.Candidate', null=True, blank=True, on_delete=models.SET_NULL)
    filename = models.CharField(max_length=255)
    file = models.FileField(upload_to='documents/')
    size = models.PositiveBigIntegerField()
    mime_type = models.CharField(max_length=100)
    doc_type = models.CharField(max_length=20, choices=DOC_TYPE_CHOICES, default='unknown')
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='upload')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    processing_progress = models.IntegerField(default=0)
    processing_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    processing_result = models.TextField(null=True, blank=True)
```

### List Response Shape

> [!IMPORTANT]
> The frontend handles BOTH array responses AND `{ count, results }` paginated responses. Use DRF standard `PageNumberPagination` — the Next.js proxy normalizes to `{ total_documents, documents, offset, limit }`.

```json
{
  "count": 100,
  "results": [{ "id": 1, "filename": "CV_John.pdf", "doc_type": "pdf", "size": 102400, "source": "upload", "processing_status": "completed", "uploaded_at": "...", "uploaded_by": { "id": 1, "name": "Admin" }, "candidate": null, "company": "Acme" }]
}
```

---

## 4. 👥 Candidates — `api/v1/candidates/`

### Endpoints Required

| Method | URL | Description |
|--------|-----|-------------|
| `GET` | `/api/v1/candidates/candidates/` | List all candidates |
| `POST` | `/api/v1/candidates/candidates/` | Create candidate |
| `GET` | `/api/v1/candidates/candidates/{id}/` | Get single candidate |
| `PUT` | `/api/v1/candidates/candidates/{id}/` | Full update |
| `PATCH` | `/api/v1/candidates/candidates/{id}/` | Partial update |
| `DELETE` | `/api/v1/candidates/candidates/{id}/` | Delete candidate |
| `GET` | `/api/v1/candidates/resumes/` | List all resumes |
| `POST` | `/api/v1/candidates/resumes/` | Create resume |
| `GET` | `/api/v1/candidates/resumes/{id}/` | Get single resume |
| `PUT` | `/api/v1/candidates/resumes/{id}/` | Full update |
| `PATCH` | `/api/v1/candidates/resumes/{id}/` | Partial update |
| `DELETE` | `/api/v1/candidates/resumes/{id}/` | Delete resume |

### Candidate Model
```python
class Candidate(models.Model):
    company = models.ForeignKey('accounts.Company', on_delete=models.CASCADE)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email1 = models.EmailField()
    email2 = models.EmailField(blank=True)
    phone1 = models.CharField(max_length=30)
    phone2 = models.CharField(max_length=30, blank=True)
    location = models.CharField(max_length=255, blank=True)
    photo = models.JSONField(null=True, blank=True)   # { filename, base64 }
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
```

### Candidate Serializer Response
```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "full_name": "John Doe",
  "email1": "john@example.com",
  "email2": "",
  "phone1": "+1234567890",
  "phone2": "",
  "location": "Paris, France",
  "photo": null,
  "company": 1,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

### Resume Model
```python
class Resume(models.Model):
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE)
    company = models.ForeignKey('accounts.Company', on_delete=models.CASCADE)
    document = models.ForeignKey('documents.Document', on_delete=models.CASCADE)
    json_data = models.JSONField()
    source = models.CharField(max_length=50)
    schema_version = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
```

### ResumeJsonData Structure (stored in `json_data`)
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "title": "Software Engineer",
  "summary": [{ "status": "validated", "summary": "Senior developer with 5 years exp." }],
  "linkedin": "https://linkedin.com/in/johndoe",
  "location": "Paris",
  "mobility": "Flexible",
  "education": [{ "school": "MIT", "degrees": [{ "from_": "2018", "to": "2022", "major": "CS", "degree": "Bachelor", "status": "validated" }] }],
  "languages": [{ "language": "English", "level": "C2", "status": "validated" }],
  "experience": [{ "company": "Acme", "positions": [{ "title": "Dev", "from_": "2022", "to": "2024", "responsibilities": [{ "description": "Built APIs", "status": "validated" }], "skillsUsed": { "technologies": [{ "name": "Python", "status": "validated" }] } }] }]
}
```

---

## 5. 💼 Positions — `api/v1/positions/`

### Endpoints Required

| Method | URL | Description |
|--------|-----|-------------|
| `GET` | `/api/v1/positions/positions/` | List positions (array, no pagination) |
| `POST` | `/api/v1/positions/positions/` | Create position |
| `GET` | `/api/v1/positions/positions/{id}/` | Get single position |
| `PUT` | `/api/v1/positions/positions/{id}/` | Full update |
| `PATCH` | `/api/v1/positions/positions/{id}/` | Partial update |
| `DELETE` | `/api/v1/positions/positions/{id}/` | Delete position |
| `GET` | `/api/v1/positions/skills/` | List all skills (array) |
| `POST` | `/api/v1/positions/skills/` | Create skill |
| `GET` | `/api/v1/positions/skills/{id}/` | Get single skill |
| `PUT` | `/api/v1/positions/skills/{id}/` | Full update |
| `PATCH` | `/api/v1/positions/skills/{id}/` | Partial update |
| `DELETE` | `/api/v1/positions/skills/{id}/` | Delete skill |
| `GET` | `/api/v1/positions/conditions/` | List conditions (paginated) |
| `POST` | `/api/v1/positions/conditions/` | Create condition |
| `GET` | `/api/v1/positions/conditions/{id}/` | Get single condition |
| `PUT` | `/api/v1/positions/conditions/{id}/` | Full update |
| `PATCH` | `/api/v1/positions/conditions/{id}/` | Partial update |
| `DELETE` | `/api/v1/positions/conditions/{id}/` | Delete condition |
| `GET` | `/api/v1/positions/categories/` | List categories (array) |
| `GET` | `/api/v1/positions/libraries/` | List libraries (array) |

### Models

```python
class Category(models.Model):
    company = models.ForeignKey('accounts.Company', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)

class Skill(models.Model):
    SKILL_TYPE = [('hard', 'Hard'), ('soft', 'Soft')]
    company = models.ForeignKey('accounts.Company', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=10, choices=SKILL_TYPE)
    description = models.TextField(blank=True)

class Condition(models.Model):
    company = models.ForeignKey('accounts.Company', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    formula = models.TextField(blank=True)

class SkillWeight(models.Model):
    position = models.ForeignKey('Position', on_delete=models.CASCADE)
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    weight = models.FloatField(default=1.0)

class Position(models.Model):
    STATUS_CHOICES = [('open', 'Open'), ('closed', 'Closed')]
    company = models.ForeignKey('accounts.Company', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    workplace = models.ForeignKey('accounts.Workplace', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField()
    expected_hiring_date = models.DateField()
    number_to_hire = models.IntegerField(default=1)
    number_to_shortlist = models.IntegerField(default=5)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='open')
    is_library = models.BooleanField(default=False)
    hard_skills = models.ManyToManyField(Skill, through=SkillWeight, related_name='hard_skill_positions')
    soft_skills = models.ManyToManyField(Skill, through=SkillWeight, related_name='soft_skill_positions')
    conditions = models.ManyToManyField(Condition, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Library(models.Model):
    company = models.ForeignKey('accounts.Company', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    is_library = models.BooleanField(default=True)
```

### Position Response (nested skills with weights)
```json
{
  "id": 1,
  "company": 1,
  "user": 1,
  "category": { "id": 1, "name": "Engineering", "description": "" },
  "name": "Senior Python Developer",
  "description": "...",
  "expected_hiring_date": "2025-06-01",
  "number_to_hire": 3,
  "number_to_shortlist": 10,
  "status": "open",
  "is_library": false,
  "workplace": 1,
  "workplace_name": "Head Office",
  "workplace_address_line1": "123 Main St",
  "hard_skills": [{ "id": 1, "name": "Python", "type": "hard", "weight": 0.9 }],
  "soft_skills": [{ "id": 2, "name": "Communication", "type": "soft", "weight": 0.7 }],
  "conditions": [{ "id": 1, "name": "Remote" }],
  "created_at": "...",
  "updated_at": "..."
}
```

### Position Create Payload
```json
{
  "category_id": 1,
  "name": "Senior Python Developer",
  "description": "...",
  "expected_hiring_date": "2025-06-01",
  "number_to_hire": 3,
  "number_to_shortlist": 10,
  "status": "open",
  "is_library": false,
  "workplace": 1,
  "hard_skill_ids": [1, 2],
  "soft_skill_ids": [3],
  "condition_ids": [1]
}
```

---

## 6. 🧠 Assessment — `api/v1/assessment/`

### Endpoints Required

| Method | URL | Description |
|--------|-----|-------------|
| `GET` | `/api/v1/assessment/templates/` | List quiz templates (`?skill=<id>`) |
| `POST` | `/api/v1/assessment/templates/` | Create template |
| `GET` | `/api/v1/assessment/templates/{id}/` | Get single template |
| `PUT` | `/api/v1/assessment/templates/{id}/` | Full update |
| `PATCH` | `/api/v1/assessment/templates/{id}/` | Partial update |
| `DELETE` | `/api/v1/assessment/templates/{id}/` | Delete template |
| `GET` | `/api/v1/assessment/categories/` | List quiz categories (`?template=<id>`) |
| `POST` | `/api/v1/assessment/categories/` | Create category |
| `GET` | `/api/v1/assessment/categories/{id}/` | Get single category |
| `PUT` | `/api/v1/assessment/categories/{id}/` | Full update |
| `DELETE` | `/api/v1/assessment/categories/{id}/` | Delete category |
| `GET` | `/api/v1/assessment/questions/` | List questions |
| `POST` | `/api/v1/assessment/questions/` | Create question |
| `GET` | `/api/v1/assessment/questions/{id}/` | Get single question |
| `PUT` | `/api/v1/assessment/questions/{id}/` | Full update |
| `PATCH` | `/api/v1/assessment/questions/{id}/` | Partial update |
| `DELETE` | `/api/v1/assessment/questions/{id}/` | Delete question |
| `GET` | `/api/v1/assessment/choices/` | List question choices |
| `POST` | `/api/v1/assessment/choices/` | Create choice |
| `GET` | `/api/v1/assessment/choices/{id}/` | Get single choice |
| `PUT` | `/api/v1/assessment/choices/{id}/` | Update choice |
| `DELETE` | `/api/v1/assessment/choices/{id}/` | Delete choice |
| `GET` | `/api/v1/assessment/quizzes/{id}/` | Get quiz instance |
| `PUT` | `/api/v1/assessment/quizzes/{id}/` | Full update quiz instance |
| `PATCH` | `/api/v1/assessment/quizzes/{id}/` | Partial update quiz instance |
| `DELETE` | `/api/v1/assessment/quizzes/{id}/` | Delete quiz instance (204) |
| `POST` | `/api/v1/assessment/quizzes/{id}/complete/` | Mark quiz as complete |
| `POST` | `/api/v1/assessment/public/generate_quiz/` | Generate quiz for candidate |
| `GET` | `/api/v1/assessment/public/quiz/{id}/` | Get public quiz |
| `POST` | `/api/v1/assessment/public/quiz/{id}/submit/` | Submit quiz answers |

### Models

```python
class QuizTemplate(models.Model):
    LANG_MODE = [('flexible','flexible'),('fixed','fixed')]
    CAT_MIX = [('uniform','uniform'),('weighted','weighted'),('custom','custom')]
    DIFF_MIX = [('uniform','uniform'),('progressive','progressive'),('custom','custom')]
    PURPOSE = [('skill','skill'),('interview','interview'),('satisfaction','satisfaction'),('other','other')]

    company = models.ForeignKey('accounts.Company', on_delete=models.CASCADE)
    skill = models.ForeignKey('positions.Skill', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    version = models.CharField(max_length=20, default='1.0')
    description = models.TextField(blank=True)
    purpose = models.CharField(max_length=20, choices=PURPOSE, default='skill')
    language_mode = models.CharField(max_length=20, choices=LANG_MODE, default='fixed')
    language_code = models.CharField(max_length=10, default='en')
    category_mix_mode = models.CharField(max_length=20, choices=CAT_MIX, default='uniform')
    difficulty_mix_mode = models.CharField(max_length=20, choices=DIFF_MIX, default='uniform')
    default_question_count = models.IntegerField(default=10)
    is_library = models.BooleanField(default=False)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class QuizCategory(models.Model):
    template = models.ForeignKey(QuizTemplate, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    weight = models.FloatField(default=1.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class QuizCategoryTranslation(models.Model):
    category = models.ForeignKey(QuizCategory, on_delete=models.CASCADE, related_name='translations')
    language_code = models.CharField(max_length=10)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)


class Question(models.Model):
    QUESTION_TYPES = [('yesno','yesno'),('single_choice','single_choice'),('multi_choice','multi_choice'),('rating','rating'),('numeric','numeric'),('text','text')]

    template = models.ForeignKey(QuizTemplate, on_delete=models.CASCADE, related_name='questions')
    category = models.ForeignKey(QuizCategory, null=True, blank=True, on_delete=models.SET_NULL)
    text = models.TextField()
    type = models.CharField(max_length=20, choices=QUESTION_TYPES)
    difficulty = models.IntegerField(default=1)
    expected_duration = models.IntegerField(default=60)  # seconds
    max_score = models.FloatField(default=1.0)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    expected_value = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class QuestionTranslation(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='translations')
    language_code = models.CharField(max_length=10)
    text = models.TextField()


class QuestionChoice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    text = models.TextField()
    is_correct = models.BooleanField(default=False)
    weight = models.FloatField(default=0.0)


class QuizInstance(models.Model):
    LANG_MODE = [('auto','auto'),('flexible','flexible'),('fixed','fixed')]
    template = models.ForeignKey(QuizTemplate, on_delete=models.CASCADE)
    candidate = models.ForeignKey('candidates.Candidate', on_delete=models.CASCADE)
    recruiter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    language_mode = models.CharField(max_length=20, choices=LANG_MODE, default='auto')
    language_code = models.CharField(max_length=10, default='en')
    question_count = models.IntegerField(default=10)
    duration_seconds = models.IntegerField(default=0)
    is_completed = models.BooleanField(default=False)
    score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### Template Serializer Response
```json
{
  "id": 1,
  "name": "Python Assessment",
  "version": "1.0",
  "description": "...",
  "skill": 1,
  "skill_name": "Python",
  "language_mode": "fixed",
  "language_code": "en",
  "category_mix_mode": "uniform",
  "difficulty_mix_mode": "uniform",
  "default_question_count": 10,
  "is_library": false,
  "is_published": true,
  "categories": [
    { "id": 1, "name": "Syntax", "description": "", "weight": 1.0, "template": 1, "translations": [], "created_at": "...", "updated_at": "..." }
  ],
  "created_at": "...",
  "updated_at": "..."
}
```

### Question Serializer Response
```json
{
  "id": 1,
  "template": 1,
  "category": 1,
  "category_name": "Syntax",
  "text": "What is a list comprehension?",
  "type": "single_choice",
  "difficulty": 2,
  "expected_duration": 60,
  "max_score": 1.0,
  "is_active": true,
  "order": 0,
  "expected_value": null,
  "choices": [{ "id": 1, "text": "A way to create lists...", "is_correct": true, "weight": 1.0 }],
  "translations": [{ "id": 1, "language_code": "fr", "text": "Qu'est-ce que..." }],
  "created_at": "...",
  "updated_at": "..."
}
```

### QuizInstance Response
```json
{
  "id": 1,
  "template": 1,
  "template_name": "Python Assessment",
  "skill": 1,
  "skill_name": "Python",
  "candidate": 5,
  "recruiter": 2,
  "language_mode": "auto",
  "language_code": "en",
  "question_count": 10,
  "duration_seconds": 0,
  "is_completed": false,
  "score": 0.0,
  "created_at": "...",
  "updated_at": "..."
}
```

### Generate Quiz Payload & Response
```json
// Request POST /api/v1/assessment/public/generate_quiz/
{ "template_id": 1, "candidate_id": 0, "question_count": 10 }

// Response
{ "quiz_id": 42, "message": "Quiz generated successfully" }
```

---

## 7. 🎯 Matching — `api/v1/matching/`

### Endpoints Required

| Method | URL | Description |
|--------|-----|-------------|
| `GET` | `/api/v1/matching/position/{id}/` | Get candidates matching a position |

### Matching Response
```json
[
  {
    "candidate": { "id": 1, "first_name": "John", "last_name": "Doe" },
    "score": 0.87,
    "matched_hard_skills": ["Python", "Django"],
    "matched_soft_skills": ["Communication"],
    "resume_id": 5
  }
]
```

> [!NOTE]
> Called with `cache: 'no-store'` from frontend. Implement scoring by comparing candidate resume `json_data.experience.skillsUsed` against position `hard_skills` and `soft_skills` with their weights.

---

## 8. 🔄 Workflow — `api/v1/workflow/`

### Endpoints Required

| Method | URL | Description |
|--------|-----|-------------|
| `GET` | `/api/v1/workflow/config/` | List configs (`?position=<id>`) |
| `POST` | `/api/v1/workflow/config/` | Create config |
| `GET` | `/api/v1/workflow/config/{id}/` | Get single config |
| `PUT` | `/api/v1/workflow/config/{id}/` | Full update |
| `PATCH` | `/api/v1/workflow/config/{id}/` | Partial update |
| `DELETE` | `/api/v1/workflow/config/{id}/` | Delete config |

### WorkflowConfig Model
```python
class WorkflowConfig(models.Model):
    company = models.ForeignKey('accounts.Company', on_delete=models.CASCADE)
    position = models.ForeignKey('positions.Position', on_delete=models.CASCADE)
    stages = models.JSONField(default=list)
    settings = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

---

## 9. 📊 Dashboard — `api/v1/dashboard/`

### Endpoints Required

| Method | URL | Description |
|--------|-----|-------------|
| `GET` | `/api/v1/dashboard/top-matches/` | Top candidate-position matches |
| `GET` | `/api/v1/dashboard/positions-matching/` | Positions with matching stats |
| `GET` | `/api/v1/dashboard/candidates-trend/` | Candidates created over time |
| `GET` | `/api/v1/dashboard/jekjob-candidates-trend/` | JekJob platform candidates trend |

### Response Shapes

**`/top-matches/`**
```json
[{ "position_id": 1, "position_name": "Senior Dev", "candidate_id": 5, "candidate_name": "John Doe", "score": 0.92 }]
```

**`/positions-matching/`**
```json
[{ "position_id": 1, "position_name": "Senior Dev", "total_candidates": 50, "matched_candidates": 12, "avg_score": 0.75 }]
```

**`/candidates-trend/`** and **`/jekjob-candidates-trend/`**
```json
[{ "date": "2025-01-01", "count": 5 }, { "date": "2025-01-08", "count": 12 }]
```

---

## Django Project Structure

```
backend/
├── manage.py
├── config/
│   ├── settings/
│   │   ├── base.py
│   │   ├── local.py
│   │   └── production.py
│   ├── urls.py
│   └── wsgi.py
└── apps/
    ├── accounts/       # Company, User, Workplace
    ├── auth_custom/    # JWT + forgot/reset password
    ├── candidates/     # Candidate, Resume
    ├── positions/      # Position, Skill, Category, Condition, Library
    ├── assessment/     # QuizTemplate, Question, QuizInstance, Choices
    ├── matching/       # Matching engine
    ├── workflow/       # WorkflowConfig
    ├── dashboard/      # Aggregated stats views
    └── documents/      # Document upload/storage
```

---

## URL Configuration

```python
# config/urls.py
urlpatterns = [
    path('api/v1/auth/', include('apps.auth_custom.urls')),
    path('api/v1/accounts/', include('apps.accounts.urls')),
    path('api/v1/candidates/', include('apps.candidates.urls')),
    path('api/v1/positions/', include('apps.positions.urls')),
    path('api/v1/assessment/', include('apps.assessment.urls')),
    path('api/v1/matching/', include('apps.matching.urls')),
    path('api/v1/workflow/', include('apps.workflow.urls')),
    path('api/v1/dashboard/', include('apps.dashboard.urls')),
    path('api/v1/documents/', include('apps.documents.urls')),
]
```

---

## Complete Endpoint Summary

| # | App | URL Pattern | Methods |
|---|-----|-------------|---------|
| 1 | auth | `/api/v1/auth/token/` | POST |
| 2 | auth | `/api/v1/auth/token/refresh/` | POST |
| 3 | auth | `/api/v1/auth/token/verify/` | POST |
| 4 | auth | `/api/v1/auth/register/` | POST |
| 5 | auth | `/api/v1/auth/forgot-password/` | POST |
| 6 | auth | `/api/v1/auth/reset-password/` | POST |
| 7 | accounts | `/api/v1/accounts/workplaces/` | GET, POST |
| 8 | accounts | `/api/v1/accounts/workplaces/{id}/` | GET, PUT, PATCH, DELETE |
| 9 | documents | `/api/v1/documents/` | GET, POST |
| 10 | documents | `/api/v1/documents/{id}/` | GET, PUT, DELETE |
| 11 | documents | `/api/v1/documents/{id}/download/` | GET |
| 12 | candidates | `/api/v1/candidates/candidates/` | GET, POST |
| 13 | candidates | `/api/v1/candidates/candidates/{id}/` | GET, PUT, PATCH, DELETE |
| 14 | candidates | `/api/v1/candidates/resumes/` | GET, POST |
| 15 | candidates | `/api/v1/candidates/resumes/{id}/` | GET, PUT, PATCH, DELETE |
| 16 | positions | `/api/v1/positions/positions/` | GET, POST |
| 17 | positions | `/api/v1/positions/positions/{id}/` | GET, PUT, PATCH, DELETE |
| 18 | positions | `/api/v1/positions/skills/` | GET, POST |
| 19 | positions | `/api/v1/positions/skills/{id}/` | GET, PUT, PATCH, DELETE |
| 20 | positions | `/api/v1/positions/conditions/` | GET, POST |
| 21 | positions | `/api/v1/positions/conditions/{id}/` | GET, PUT, PATCH, DELETE |
| 22 | positions | `/api/v1/positions/categories/` | GET |
| 23 | positions | `/api/v1/positions/libraries/` | GET |
| 24 | assessment | `/api/v1/assessment/templates/` | GET, POST |
| 25 | assessment | `/api/v1/assessment/templates/{id}/` | GET, PUT, PATCH, DELETE |
| 26 | assessment | `/api/v1/assessment/categories/` | GET, POST |
| 27 | assessment | `/api/v1/assessment/categories/{id}/` | GET, PUT, DELETE |
| 28 | assessment | `/api/v1/assessment/questions/` | GET, POST |
| 29 | assessment | `/api/v1/assessment/questions/{id}/` | GET, PUT, PATCH, DELETE |
| 30 | assessment | `/api/v1/assessment/choices/` | GET, POST |
| 31 | assessment | `/api/v1/assessment/choices/{id}/` | GET, PUT, DELETE |
| 32 | assessment | `/api/v1/assessment/quizzes/{id}/` | GET, PUT, PATCH, DELETE |
| 33 | assessment | `/api/v1/assessment/quizzes/{id}/complete/` | POST |
| 34 | assessment | `/api/v1/assessment/public/generate_quiz/` | POST |
| 35 | assessment | `/api/v1/assessment/public/quiz/{id}/` | GET |
| 36 | assessment | `/api/v1/assessment/public/quiz/{id}/submit/` | POST |
| 37 | matching | `/api/v1/matching/position/{id}/` | GET |
| 38 | workflow | `/api/v1/workflow/config/` | GET, POST |
| 39 | workflow | `/api/v1/workflow/config/{id}/` | GET, PUT, PATCH, DELETE |
| 40 | dashboard | `/api/v1/dashboard/top-matches/` | GET |
| 41 | dashboard | `/api/v1/dashboard/positions-matching/` | GET |
| 42 | dashboard | `/api/v1/dashboard/candidates-trend/` | GET |
| 43 | dashboard | `/api/v1/dashboard/jekjob-candidates-trend/` | GET |

**Total: 43 unique URL patterns | ~70 HTTP operations**

---

## Requirements & Django Settings

```python
# requirements.txt
Django>=4.2
djangorestframework>=3.14
djangorestframework-simplejwt>=5.3
django-cors-headers>=4.0
Pillow>=10.0
python-decouple>=3.8
dj-database-url>=2.0
django-storages>=1.14

# settings/base.py
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': ['rest_framework_simplejwt.authentication.JWTAuthentication'],
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticated'],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}

CORS_ALLOWED_ORIGINS = ['http://localhost:3000', 'https://your-frontend.com']
```

---

## Implementation Priority Order

```
Phase 1 — Foundation
  [ ] apps/accounts: Company, User model, Workplace
  [ ] apps/auth_custom: JWT login/refresh, register, forgot/reset password

Phase 2 — Core Data
  [ ] apps/documents: File upload (multipart), list, download, delete
  [ ] apps/positions: Category, Skill, Condition, Position (with M2M skills), Library
  [ ] apps/candidates: Candidate, Resume (json_data structure)

Phase 3 — Assessment Engine
  [ ] apps/assessment: Template, QuizCategory, Question, QuestionChoice
  [ ] apps/assessment: QuizInstance, complete action
  [ ] apps/assessment: Public endpoints (generate_quiz, quiz detail, submit)

Phase 4 — Intelligence & Analytics
  [ ] apps/matching: Position matching engine (skill-based scoring)
  [ ] apps/workflow: WorkflowConfig CRUD
  [ ] apps/dashboard: top-matches, positions-matching, candidates-trend stats
```
