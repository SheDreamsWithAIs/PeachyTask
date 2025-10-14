# Tasks Dashboard - System Overview

This document describes the Tasks Dashboard: UI layout, data interactions, API usage, and edge-case behavior in the PeachyTask app.

## Goals
- Provide a clear view of tasks with filtering, labels, and inline management.
- Fast CRUD operations via the REST API with immediate UI updates.
- Consistent theming (light/dark) and responsive design.

## UI Layout (src/app/(app)/dashboard/page.jsx)

- Sidebar
  - Filters: All, Active, Completed counts.
  - Labels: list of user labels with multi-select filter; “Manage” opens Labels Manager modal.
- Main
  - "New Task" button toggles inline creation form.
  - Inline create form: title, description, priority, deadline, labels.
  - Task list: each row shows title, description, priority badge, deadline, labels, and actions (edit, delete, toggle complete).
  - Footer with app tagline.

### Components/Modals
- Inline create form (within page): uses POST /tasks, optimistic prepend to list on success.
- Edit Task modal: updates via PATCH /tasks/{id} and applies field-level validation.
- Delete confirmation modal: calls DELETE /tasks/{id} and removes from list.
- Labels Manager modal: CRUD for labels via /labels endpoints, validates name/color; updates label filters and chips.

## Data & API

- Fetch on mount:
  - GET /tasks → list user tasks.
  - GET /labels → list user labels (non-fatal if labels disabled).
- Create task (POST /tasks)
  - Payload: { title, description?, priority, deadline, completed=false, label_ids }.
  - On success: prepend to local list; reset form.
- Update task (PATCH /tasks/{id})
  - Supports partial fields: title, description, priority, deadline, label_ids, completed.
  - Field validation:
    - Non-empty title, valid priority, required deadline.
- Toggle complete (PATCH /tasks/{id}): { completed: !completed }.
- Delete task (DELETE /tasks/{id}).
- Labels
  - CRUD via /labels; label_ids validated on create/update for ownership.

## Theming & Accessibility

- ThemeContext controls dark mode; UI uses Tailwind classes for both themes.
- Buttons and controls use clear focus styles; modals receive focus and provide clear affordances.
- Reduce motion preference inherited from global styles.

## Filtering & Label Chips

- Filter tabs (All/Active/Completed) adjust list; counts computed from loaded tasks.
- Label filtering shows tasks containing any of the selected label_ids.
- Label chips use label color with translucent background and readable foreground.

## Error Handling

- API errors surface in inline banners (e.g., create/update failure).
- Field-level errors (from FastAPI validation) are mapped back to inputs where possible.
- Non-fatal label load failure is ignored to keep tasks flowing.

## Edge Cases

- No tasks: show empty state with CTA to create a task.
- No labels yet: labels area shows helpful empty state; manager allows creation.
- Rapid toggles/edits: UI disables buttons while requests are in-flight.

## Integration with Showdown

- Dashboard includes a "Procrastination Showdown" card/CTA.
  - Enabled when user has >= 4 active tasks; otherwise shows guidance to add tasks.
  - Navigates to /showdown/vs.

## Testing

- Cypress e2e tests cover basic CRUD:
  - Create -> Edit -> Toggle Complete -> Delete.
- Backend pytest covers task schemas and label ownership validation.

## Future Enhancements

- Bulk complete and bulk label assignment.
- Sort controls (by priority, deadline, created_at).
- Inline label creation from the new task form.
