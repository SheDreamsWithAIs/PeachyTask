describe('Showdown Phase 2 - ranking, pairing, timer persistence, undo', () => {
  const apiBase = Cypress.env('API_BASE_URL') || 'http://127.0.0.1:8000';
  let email;
  let password;
  const createdTaskIds = [];

  const today = new Date().toISOString().slice(0,10);

  const createTask = (title) => {
    return cy.request({ method: 'POST', url: `${apiBase}/tasks`, body: { title, priority: 'medium', deadline: today, label_ids: [] }, withCredentials: true })
      .then((res) => { createdTaskIds.push(res.body._id); return res.body; });
  };

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
    if (createdTaskIds.length) {
      const ids = createdTaskIds.splice(0, createdTaskIds.length);
      ids.forEach((id) => {
        cy.request({ method: 'DELETE', url: `${apiBase}/tasks/${id}`, withCredentials: true, failOnStatusCode: false });
      });
    }
  });

  it('ranks tasks, starts VS from ranked, uses timer Done, and supports undo resume', () => {
    // Ensure ≥ 4 tasks
    cy.wrap(null).then(async () => {
      await createTask('Rank T1');
      await createTask('Rank T2');
      await createTask('Rank T3');
      await createTask('Rank T4');
    });

    // Rank flow
    cy.visit('/showdown/rank');
    for (let i = 0; i < 8; i++) {
      cy.get('button').contains(/I dislike THIS one more!/).should('not.exist');
      // Click first card in grid
      cy.get('div.grid').find('button').first().click();
    }
    cy.contains('Rankings Updated!');
    cy.contains('Start Showdown').click();

    // VS page, pairing via endpoint
    cy.url().should('match', /\/showdown\/vs$/);
    cy.contains('Which task would you rather tackle?');

    // Select first card, start timer briefly, use Done
    cy.get('div.grid').find('button').first().click();
    cy.contains("LET'S DO THIS!");
    cy.contains('Start Timer').click();
    cy.wait(1200);
    cy.contains('✓ Done').click();

    // Results, with time displayed
    cy.url({ timeout: 10000 }).should('match', /\/showdown\/results/);
    cy.contains('Crushed It!');
    cy.contains(/Time Invested|Tasks Completed/);

    // Undo and resume
    cy.contains('Oops, Not Done Yet').click();
    cy.url().should('match', /\/showdown\/vs$/);
    // Should auto-select previous and show timer resumed or seconds retained
    cy.contains("LET'S DO THIS!");
  });
});


