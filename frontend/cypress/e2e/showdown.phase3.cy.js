describe('Showdown Phase 3 - landing and stats', () => {
  const apiBase = Cypress.env('API_BASE_URL') || 'http://127.0.0.1:8000';
  let email;
  let password;

  before(() => {
    email = `user_${Date.now()}@example.com`;
    password = 'Password123!';
    cy.request('POST', `${apiBase}/auth/signup`, { email, password });
  });

  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[type=email]').type(email);
    cy.get('input[type=password]').type(password);
    cy.contains('Sign in').click();
    cy.url().should('match', /\/dashboard$/);
  });

  it('navigates to landing and displays three action cards', () => {
    cy.visit('/showdown/landing');
    cy.contains('Procrastination Showdown');
    cy.contains('Rank Tasks');
    cy.contains('Start Showdown');
    cy.contains('View Stats');
  });

  it('shows stats after completing one showdown with timer', () => {
    // Ensure at least 4 tasks
    const today = new Date().toISOString().slice(0,10);
    const mk = (title) => cy.request({ method: 'POST', url: `${apiBase}/tasks`, body: { title, priority: 'medium', deadline: today, label_ids: [] }, withCredentials: true });
    mk('P3 T1'); mk('P3 T2'); mk('P3 T3'); mk('P3 T4');

    cy.visit('/showdown/vs');
    // Select and start timer briefly then Done
    cy.get('div.grid').find('button').first().click();
    cy.contains("LET'S DO THIS!");
    cy.contains('Start Timer').click();
    cy.wait(1200);
    cy.contains('✓ Done').click();

    cy.url().should('match', /\/showdown\/results/);
    cy.visit('/showdown/stats');
    cy.contains('Showdown Stats');
    cy.contains('Tasks Completed');
    cy.contains('Time Invested');
  });
});


