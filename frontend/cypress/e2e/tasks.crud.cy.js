describe('Tasks CRUD', () => {
  const apiBase = Cypress.env('API_BASE_URL') || 'http://127.0.0.1:8000';
  let email;
  let password;
  let createdTaskIds = [];

  before(() => {
    email = `user_${Date.now()}@example.com`;
    password = 'Password123!';
    // signup
    cy.request('POST', `${apiBase}/auth/signup`, { email, password });
  });

  beforeEach(() => {
    // login via UI to ensure app AuthContext refreshes
    cy.visit('/login');
    cy.get('input[type=email]').type(email);
    cy.get('input[type=password]').type(password);
    cy.contains('Sign in').click();
    cy.url().should('match', /\/dashboard$/);
  });

  afterEach(() => {
    // cleanup any created tasks
    if (createdTaskIds.length) {
      const ids = [...createdTaskIds];
      createdTaskIds = [];
      ids.forEach((id) => {
        cy.request({ method: 'DELETE', url: `${apiBase}/tasks/${id}`, withCredentials: true, failOnStatusCode: false });
      });
    }
  });

  it('creates, edits, toggles and deletes a task', () => {
    cy.visit('/dashboard');

    // open create form
    cy.contains('New Task').click();
    cy.get('input[placeholder="Enter task title..."]').type('E2E Task');
    cy.get('textarea[placeholder="Add details about this task..."]').type('E2E description');
    cy.get('select').first().select('High');
    const today = new Date().toISOString().slice(0,10);
    cy.get('input[type="date"]').first().type(today);
    cy.contains('Create Task').click();

    // should appear in list
    cy.contains('E2E Task');

    // capture created id via API
    cy.request({ method: 'GET', url: `${apiBase}/tasks`, withCredentials: true }).then((res) => {
      const task = res.body.find((t) => t.title === 'E2E Task');
      if (task) createdTaskIds.push(task._id);
    });

    // open edit modal
    cy.get('button[aria-label="Edit task"]').first().click();
    cy.get('input[type="text"]').first().clear().type('E2E Task Updated');
    cy.contains('Save Changes').click();
    cy.contains('E2E Task Updated');

    // toggle completion
    cy.get('button[aria-label="Toggle complete"]').first().click();

    // delete via modal
    cy.get('button[aria-label="Delete task"]').first().click();
    cy.contains('Delete').click();
    cy.contains('E2E Task Updated').should('not.exist');
  });
});


