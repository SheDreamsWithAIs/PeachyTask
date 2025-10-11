<!-- bff4fe9e-c14e-4bab-b366-05ec8b51a025 56961254-1470-4774-91a3-6566add13dba -->
# PeachyTask Incremental Build Plan

## Core Principles

- Work in small, testable batches
- **STOP and TEST** after each milestone
- **DO NOT PROCEED** until current feature is verified working
- Fix bugs immediately before adding new code
- Use existing MongoDB database and reference UI mockups in AI_docs/Mockups/
- Use `.env` variables; for tests use `MONGO_DB_NAME_TEST`

---

## Phase 1: Backend Foundation Setup

### Milestone 1.1: FastAPI Project Structure

**Tasks:**

- Set up basic FastAPI app structure in `/backend/app/`
- Create `main.py`, `__init__.py`, and folder structure (routes/, models/, schemas/, utils/)
- Add CORS middleware for frontend communication
- Create basic health check endpoint (`GET /health`)
- Set up pytest, `conftest.py` with `TestClient` fixture
- Write first test: health endpoint returns 200 and payload

**Verification Checkpoint:**

Verify the following elements are working:
- ✅ FastAPI server starts successfully with `uvicorn app.main:app --reload`
- ✅ `GET /health` endpoint returns 200 status code
- ✅ FastAPI auto-generated docs accessible at `/docs`
- ✅ CORS middleware configured properly
- ✅ Project folder structure created correctly (routes/, models/, schemas/, utils/)

Testing requirements:
- ✅ Write pytest test for health endpoint
- ✅ Run `pytest` - all tests must pass
- ✅ Verify test coverage for health endpoint

**STOP HERE - Do not proceed until all items verified**

---

### Milestone 1.2: MongoDB Connection

**Tasks:**

- Create database connection utility in `utils/database.py`
- Read env vars: `MONGO_URI`, `MONGO_DB_NAME_DEV`, `MONGO_DB_NAME_TEST`, `APP_ENV`
- Add connection on startup and graceful error handling
- Create test fixture to connect to test DB (`APP_ENV=test`)
- Test can insert/read a sentinel doc, then clean up

**Verification Checkpoint:**

Verify the following elements are working:
- ✅ Server starts and logs successful MongoDB connection
- ✅ Environment variables correctly read from `.env`
- ✅ Test database separate from dev database
- ✅ Database connection closes gracefully on shutdown
- ✅ Error handling works for failed connections

Testing requirements:
- ✅ Write pytest tests for database connection
- ✅ Write test for inserting and reading a document
- ✅ Write test for cleanup between tests
- ✅ Run `pytest` - all tests must pass (including previous milestone tests)

**STOP HERE - Do not proceed until all items verified**

---

## Phase 2: Authentication System

### Milestone 2.1: User Model & Password Security

**Tasks:**

- Create User model in `models/user.py` (email unique, password_hash, created_at)
- Create Pydantic schemas in `schemas/user.py`
- Implement password hashing (bcrypt) and JWT utils in `utils/auth.py`

**Verification Checkpoint:**

Verify the following elements are working:
- ✅ User model created with all required fields
- ✅ Email field has unique constraint
- ✅ Password hashing function works correctly
- ✅ Password verification function works correctly
- ✅ JWT token creation works
- ✅ JWT token verification works
- ✅ JWT expiry is honored

Testing requirements:
- ✅ Write pytest tests for password hashing round-trip
- ✅ Write pytest tests for JWT creation and verification
- ✅ Write pytest tests for JWT expiry
- ✅ Run `pytest` - all tests must pass (including previous milestone tests)

**STOP HERE - Do not proceed until all items verified**

---

### Milestone 2.2: Signup Endpoint

**Tasks:**

- Implement `POST /auth/signup` in `routes/auth.py`
- Validate email format and password strength
- Enforce unique email
- Return JWT in HTTPOnly cookie

**Verification Checkpoint:**

Verify the following elements are working:
- ✅ `POST /auth/signup` endpoint created
- ✅ Successful signup returns 201 status code
- ✅ JWT set in HTTPOnly cookie on successful signup
- ✅ User saved to database with hashed password
- ✅ Duplicate email returns 409 or 400 error
- ✅ Invalid email format returns 422 or 400 error
- ✅ Weak password returns 422 or 400 error

Testing requirements:
- ✅ Write pytest test for successful signup
- ✅ Write pytest test for duplicate email rejection
- ✅ Write pytest test for invalid email format
- ✅ Write pytest test for weak password rejection
- ✅ Write pytest test verifying cookie is set
- ✅ Run `pytest` - all tests must pass (including previous milestone tests)

**STOP HERE - Do not proceed until all items verified**

---

### Milestone 2.3: Login, Logout, Me

**Tasks:**

- `POST /auth/login` verifies credentials; set JWT cookie
- `POST /auth/logout` clears cookie
- `GET /auth/me` returns current user

**Verification Checkpoint:**

Verify the following elements are working:
- ✅ `POST /auth/login` endpoint created
- ✅ Successful login with valid credentials returns 200
- ✅ JWT cookie set on successful login
- ✅ Invalid credentials return 401 error
- ✅ `POST /auth/logout` endpoint created
- ✅ Logout clears the JWT cookie
- ✅ `GET /auth/me` endpoint created
- ✅ `/auth/me` with valid cookie returns user info
- ✅ `/auth/me` without cookie returns 401 error
- ✅ `/auth/me` after logout returns 401 error

Testing requirements:
- ✅ Write pytest test for successful login
- ✅ Write pytest test for failed login (wrong password)
- ✅ Write pytest test for logout clearing cookie
- ✅ Write pytest test for `/auth/me` with valid auth
- ✅ Write pytest test for `/auth/me` without auth
- ✅ Write pytest test for `/auth/me` after logout
- ✅ Run `pytest` - all tests must pass (including previous milestone tests)

**STOP HERE - Do not proceed until all items verified**

---

## Phase 3: Tasks Backend

### Milestone 3.1: Task Model & Schemas

**Tasks:**

- Create Task model `models/task.py` (title req, description?, priority enum high|medium|low, deadline date, completed bool, label_ids [ObjectId], user_id)
- Create Pydantic schemas `schemas/task.py` (create/update/response)

**Verification Checkpoint:**

Verify the following elements are working:
- ✅ Task model created with all required fields
- ✅ Title field is required
- ✅ Priority enum accepts only: high, medium, low
- ✅ Deadline accepts valid date format
- ✅ Completed defaults to false
- ✅ User_id properly links to user
- ✅ Label_ids accepts array of ObjectIds
- ✅ Pydantic schemas validate correctly

Testing requirements:
- ✅ Write pytest test for valid task schema
- ✅ Write pytest test for missing title (should fail)
- ✅ Write pytest test for invalid priority (should fail)
- ✅ Write pytest test for invalid deadline format (should fail)
- ✅ Run `pytest` - all tests must pass (including previous milestone tests)

**STOP HERE - Do not proceed until all items verified**

---

### Milestone 3.2: Create & List Tasks

**Tasks:**

- `POST /tasks` (auth required) creates task for current user
- `GET /tasks` lists only current user's tasks

**Verification Checkpoint:**

Verify the following elements are working:
- ✅ `POST /tasks` endpoint created
- ✅ Authentication required for creating tasks
- ✅ Unauthorized request returns 401
- ✅ Valid task creation returns 201 status
- ✅ Task saved to database with correct user_id
- ✅ Missing title returns 422 error
- ✅ Invalid deadline format returns 422 error
- ✅ `GET /tasks` endpoint created
- ✅ Returns only current user's tasks
- ✅ Does not return other users' tasks

Testing requirements:
- ✅ Write pytest test for unauthorized create (no auth)
- ✅ Write pytest test for successful task creation
- ✅ Write pytest test for missing title
- ✅ Write pytest test for invalid deadline
- ✅ Write pytest test for listing tasks (single user)
- ✅ Write pytest test for task isolation (two users, verify separation)
- ✅ Run `pytest` - all tests must pass (including previous milestone tests)

**STOP HERE - Do not proceed until all items verified**

---

### Milestone 3.3: Read, Update, Delete Task

**Tasks:**

- `GET /tasks/:id`, `PATCH /tasks/:id`, `DELETE /tasks/:id`
- Enforce ownership on all routes

**Verification Checkpoint:**

Verify the following elements are working:
- ✅ `GET /tasks/:id` endpoint created
- ✅ Returns 404 for non-existent task
- ✅ Returns task data for valid id
- ✅ `PATCH /tasks/:id` endpoint created
- ✅ Updates only provided fields
- ✅ Can toggle completed status
- ✅ Returns 404 for non-existent task
- ✅ `DELETE /tasks/:id` endpoint created
- ✅ Removes task from database
- ✅ Returns 404 for non-existent task after deletion
- ✅ All endpoints return 403 when user tries to access another user's task

Testing requirements:
- ✅ Write pytest test for GET with valid id
- ✅ Write pytest test for GET with invalid id (404)
- ✅ Write pytest test for PATCH updating fields
- ✅ Write pytest test for PATCH toggling completed
- ✅ Write pytest test for PATCH with invalid id (404)
- ✅ Write pytest test for DELETE removing task
- ✅ Write pytest test for DELETE with invalid id (404)
- ✅ Write pytest test for ownership enforcement (403 for other user's tasks)
- ✅ Run `pytest` - all tests must pass (including previous milestone tests)

**STOP HERE - Do not proceed until all items verified**

---

## Phase 4: Labels Backend

### Milestone 4.1: Label Model & CRUD

**Tasks:**

- `models/label.py` (name, name_normalized, color?, user_id)
- `schemas/label.py`; endpoints: GET/POST/PATCH/DELETE `/labels`
- Prevent duplicate label `name_normalized` per user

**Verification Checkpoint:**

Verify the following elements are working:
- ✅ Label model created with all required fields
- ✅ Name_normalized field stores lowercase version
- ✅ Color field is optional
- ✅ User_id properly links to user
- ✅ `GET /labels` endpoint created and returns user's labels
- ✅ `POST /labels` endpoint created
- ✅ Duplicate name_normalized per user is rejected
- ✅ Same label name allowed for different users
- ✅ `PATCH /labels/:id` endpoint updates label
- ✅ `DELETE /labels/:id` endpoint removes label

Testing requirements:
- ✅ Write pytest test for creating label
- ✅ Write pytest test for listing labels
- ✅ Write pytest test for updating label
- ✅ Write pytest test for deleting label
- ✅ Write pytest test for duplicate label rejection (same user)
- ✅ Write pytest test allowing same name across different users
- ✅ Run `pytest` - all tests must pass (including previous milestone tests)

**STOP HERE - Do not proceed until all items verified**

---

### Milestone 4.2: Task-Label Relationships

**Tasks:**

- Allow `label_ids` on create/update task
- Validate all label_ids belong to current user and exist

**Verification Checkpoint:**

Verify the following elements are working:
- ✅ Can create task with label_ids array
- ✅ Valid label_ids save correctly to task
- ✅ Invalid label_id returns 400 or 422 error
- ✅ Label_ids from another user are rejected
- ✅ Can update task to add labels
- ✅ Can update task to remove labels
- ✅ Task displays associated labels correctly

Testing requirements:
- ✅ Write pytest test for creating task with valid labels
- ✅ Write pytest test for creating task with invalid label_id
- ✅ Write pytest test for creating task with another user's label (should fail)
- ✅ Write pytest test for updating task to add labels
- ✅ Write pytest test for updating task to remove labels
- ✅ Run `pytest` - all tests must pass (including previous milestone tests)

**STOP HERE - Do not proceed until all items verified**

---

## Phase 5: Frontend Foundation (JavaScript)

### Milestone 5.1: Next.js Setup

**Tasks:**

- Initialize Next.js project in `/frontend/` (JavaScript, no TypeScript)
- Configure Tailwind CSS
- Set up folders: `components/`, `app/` (or `pages/`), `lib/`
- Add simple API client utility
- Testing setup: Jest + React Testing Library; sample component test

**Verification Checkpoint:**

Verify the following elements are working:
- ✅ Next.js project initialized successfully
- ✅ `npm run dev` starts development server
- ✅ Tailwind CSS styles are visible
- ✅ Folder structure created (components/, app/ or pages/, lib/)
- ✅ API client utility created
- ✅ Jest configured properly
- ✅ React Testing Library configured properly
- ✅ Sample component renders

Testing requirements:
- ✅ Write sample component test
- ✅ Run `npm test` - sample test must pass

**STOP HERE - Do not proceed until all items verified**

---

### Milestone 5.2: Auth Pages (Signup & Login)

**Tasks:**

- Reference mockups `peachy-task-signup.tsx` and `peachy-task-login.tsx` (adapt to JS)
- Build forms with client-side validation and API calls

**Verification Checkpoint:**

Verify the following elements are working:
- ✅ Signup page renders correctly
- ✅ Signup form has all required fields
- ✅ Client-side validation works (email format, password requirements)
- ✅ Signup form calls API on submit
- ✅ Success navigates to dashboard/home
- ✅ API errors display to user
- ✅ Login page renders correctly
- ✅ Login form has all required fields
- ✅ Client-side validation works
- ✅ Login form calls API on submit
- ✅ Success navigates to dashboard/home
- ✅ API errors display to user

Testing requirements:
- ✅ Write test for signup form rendering
- ✅ Write test for signup form validation
- ✅ Write test for signup API call
- ✅ Write test for signup error handling
- ✅ Write test for login form rendering
- ✅ Write test for login form validation
- ✅ Write test for login API call
- ✅ Write test for login error handling
- ✅ Run `npm test` - all tests must pass

**STOP HERE - Do not proceed until all items verified**

---

### Milestone 5.3: Auth State & Protected Routes

**Tasks:**

- Implement auth state (context) and protected route guard
- Logout action and header with user info

**Verification Checkpoint:**

Verify the following elements are working:
- ✅ Auth context created and provides auth state
- ✅ Protected route guard redirects unauthenticated users
- ✅ Authenticated users can access protected pages
- ✅ Header displays user info when authenticated
- ✅ Logout action clears auth state
- ✅ Logout redirects to login page
- ✅ Auth state persists on page refresh (if applicable)

Testing requirements:
- ✅ Write test for auth context providing state
- ✅ Write test for protected route redirect (no auth)
- ✅ Write test for protected route access (with auth)
- ✅ Write test for logout clearing state
- ✅ Write test for logout redirect
- ✅ Run `npm test` - all tests must pass

**STOP HERE - Do not proceed until all items verified**

---

## Phase 6: Frontend Task Management

### Milestone 6.1: Task List Display

**Tasks:**

- Reference mockup `todo-app-mockup.tsx`
- Render list of tasks with properties and empty state

**Verification Checkpoint:**

Verify the following elements are working:
- ✅ Task list component renders
- ✅ Fetches tasks from API
- ✅ Displays all task properties (title, description, priority, deadline, labels)
- ✅ Empty state displays when no tasks
- ✅ Loading state displays while fetching
- ✅ Error state displays on API failure
- ✅ Tasks are sorted/filtered appropriately

Testing requirements:
- ✅ Write test for rendering task list with mocked data
- ✅ Write test for empty state
- ✅ Write test for loading state
- ✅ Write test for error state
- ✅ Run `npm test` - all tests must pass

**STOP HERE - Do not proceed until all items verified**

---

### Milestone 6.2: Create New Task

**Tasks:**

- Reference `todo-app-new-task.tsx`; build create form/modal
- Validate inputs; priority selector; submit to API

**Verification Checkpoint:**

Verify the following elements are working:
- ✅ Create task form/modal opens
- ✅ Form has all required fields (title, description, priority, deadline)
- ✅ Client-side validation works
- ✅ Priority selector displays options
- ✅ Date picker works for deadline
- ✅ Form submits to API
- ✅ Success adds task to list (optimistic or refetch)
- ✅ API errors display to user
- ✅ Form closes after successful submit
- ✅ Form can be cancelled

Testing requirements:
- ✅ Write test for form rendering
- ✅ Write test for form validation
- ✅ Write test for successful submit
- ✅ Write test for API error handling
- ✅ Write test for UI update after submit
- ✅ Write test for cancel action
- ✅ Run `npm test` - all tests must pass

**STOP HERE - Do not proceed until all items verified**

---

### Milestone 6.3: Edit & Delete Tasks

**Tasks:**

- Edit form with pre-filled values; delete with confirm; toggle completion

**Verification Checkpoint:**

Verify the following elements are working:
- ✅ Edit form opens with pre-filled values
- ✅ Can modify all task fields
- ✅ Save updates task via API
- ✅ Success updates task in list
- ✅ API errors display to user
- ✅ Delete button triggers confirmation
- ✅ Confirm deletes task via API
- ✅ Success removes task from list
- ✅ Toggle completion button works
- ✅ Completion status updates via API
- ✅ Visual feedback for completed tasks

Testing requirements:
- ✅ Write test for edit form with pre-filled data
- ✅ Write test for updating task
- ✅ Write test for delete confirmation
- ✅ Write test for deleting task
- ✅ Write test for toggling completion
- ✅ Write test for completed task visual state
- ✅ Run `npm test` - all tests must pass

**STOP HERE - Do not proceed until all items verified**

---

## Phase 7: Frontend Labels

### Milestone 7.1: Label Management UI

**Tasks:**

- Reference `peachy-task-settings.tsx` for label UI
- CRUD labels in UI with colors

**Verification Checkpoint:**

Verify the following elements are working:
- ✅ Label management UI renders
- ✅ Displays list of existing labels
- ✅ Create label form works
- ✅ Can set label color
- ✅ Edit label form pre-fills values
- ✅ Can update label name and color
- ✅ Delete label triggers confirmation
- ✅ Deleting label removes from list
- ✅ All CRUD operations call API correctly
- ✅ API errors display to user

Testing requirements:
- ✅ Write test for rendering label list
- ✅ Write test for creating label
- ✅ Write test for editing label
- ✅ Write test for deleting label
- ✅ Write test for color display
- ✅ Run `npm test` - all tests must pass

**STOP HERE - Do not proceed until all items verified**

---

### Milestone 7.2: Assign Labels to Tasks

**Tasks:**

- Multi-select labels in create/edit task; display chips

**Verification Checkpoint:**

Verify the following elements are working:
- ✅ Label selector displays in create task form
- ✅ Label selector displays in edit task form
- ✅ Can select multiple labels
- ✅ Selected labels display as chips/tags
- ✅ Can remove labels from selection
- ✅ Labels save correctly when creating task
- ✅ Labels save correctly when editing task
- ✅ Task list displays assigned labels
- ✅ Label colors display correctly on task cards
- ✅ (Optional) Filtering by label works

Testing requirements:
- ✅ Write test for label selector rendering
- ✅ Write test for selecting labels
- ✅ Write test for removing labels
- ✅ Write test for labels in task list display
- ✅ Write test for label chip rendering
- ✅ (If implemented) Write test for filtering by label
- ✅ Run `npm test` - all tests must pass

**STOP HERE - Do not proceed until all items verified**

### To-dos

- [ ] Set up FastAPI project structure and health check endpoint
- [ ] Configure MongoDB connection with existing Atlas database
- [ ] Create User model, password hashing, and JWT utilities
- [ ] Implement signup endpoint with validation
- [ ] Implement login, logout, and /me endpoints
- [ ] Create Task model and schemas with validation
- [ ] Implement create and list task endpoints
- [ ] Implement get, update, and delete task endpoints
- [ ] Create Label model and implement all label endpoints
- [ ] Implement and validate task-label relationships
- [ ] Initialize Next.js with TypeScript and Tailwind
- [ ] Build signup and login pages using mockups
- [ ] Implement auth state management and protected routes
- [ ] Create task list page with all task properties
- [ ] Build task creation form using mockup
- [ ] Implement edit and delete task functionality
- [ ] Create label management UI with CRUD operations
- [ ] Add label assignment to tasks and display in UI
- [ ] End-to-end testing and user story verification