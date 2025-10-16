describe('Showdown MVP flow', () => {
  const apiBase = Cypress.env('API_BASE_URL') || 'http://127.0.0.1:8000';
  let email;
  let password;
  const createdTaskIds = [];

  before(() => {
    email = `user_${Date.now()}@example.com`;
    password = 'Password123!';
    cy.request('POST', `${apiBase}/auth/signup`, { email, password });
  });

  beforeEach(() => {
    // login via UI to ensure cookies and AuthContext
    cy.visit('/login');
    cy.get('input[type=email]').type(email);
    cy.get('input[type=password]').type(password);
    cy.contains('Sign in').click();
    cy.url().should('match', /\/dashboard$/);
  });

  afterEach(() => {
    // cleanup created tasks
    if (createdTaskIds.length) {
      const ids = createdTaskIds.splice(0, createdTaskIds.length);
      ids.forEach((id) => {
        cy.request({ method: 'DELETE', url: `${apiBase}/tasks/${id}`, withCredentials: true, failOnStatusCode: false });
      });
    }
  });

  it('navigates to VS, selects and completes a task, and sees results', () => {
    cy.visit('/dashboard');

    // Ensure at least 4 active tasks exist
    const today = new Date().toISOString().slice(0,10);
    const createTask = (title) => {
      cy.request({ method: 'POST', url: `${apiBase}/tasks`, body: { title, priority: 'medium', deadline: today, label_ids: [] }, withCredentials: true })
        .then((res) => { createdTaskIds.push(res.body._id); });
    };
    createTask('S1');
    createTask('S2');
    createTask('S3');
    createTask('S4');

    cy.reload();
    cy.contains('Procrastination Showdown');
    cy.contains('Start Showdown').click();

    cy.url().should('match', /\/showdown\/vs$/);
    // Two sides exist
    cy.contains("Which task would you rather tackle?");

    // Click left or right area (buttons)
    cy.get('button').contains("LET'S DO THIS!").should('not.exist');
    cy.get('div.grid.grid-cols-2').find('button').first().click();
    cy.contains("LET'S DO THIS!");

    // Mark done (check icon area)
    cy.get('div.grid.grid-cols-2').find('button').first().within(() => {
      cy.get('svg').first().click({ force: true });
    });

    cy.url({ timeout: 10000 }).should('match', /\/showdown\/results/);
    cy.contains('Crushed It!');
    cy.contains('Another Showdown');
    cy.contains('Dashboard').click();
    cy.url().should('match', /\/dashboard$/);
  });
});


