describe('Auth flow', () => {
  it('logs in via UI with stubbed API and reaches /dashboard', () => {
    const email = `user_${Date.now()}@example.com`;
    const password = 'Password123!';

    // login via UI
    cy.intercept('POST', 'http://127.0.0.1:8000/auth/login', { statusCode: 200, body: {} }).as('login');
    cy.intercept('GET', 'http://127.0.0.1:8000/auth/me', { statusCode: 200, body: { email } }).as('me');
    cy.visit('/login');
    cy.get('input[type=email]').type(email);
    cy.get('input[type=password]').type(password);
    cy.contains('Sign in').click();

    cy.url({ timeout: 10000 }).should('match', /\/dashboard$/);
    cy.contains('New Task');
  });
});


