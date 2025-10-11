describe('Auth flow', () => {
  const apiBase = Cypress.env('API_BASE_URL') || 'http://127.0.0.1:8000';

  it('signs up, logs out, logs in, and reaches /tasks', () => {
    const email = `user_${Date.now()}@example.com`;
    const password = 'Password123!';

    // visit signup
    cy.visit('/signup');
    cy.get('input[type=email]').type(email);
    cy.get('input[type=password]').type(password);
    cy.contains('Create account').click();

    // should redirect to home then navigate to tasks
    cy.url().should('match', /\/$/);

    // logout via API to clear cookie
    cy.request({
      method: 'POST',
      url: `${apiBase}/auth/logout`,
      body: {},
      withCredentials: true,
    });

    // login
    cy.visit('/login');
    cy.get('input[type=email]').type(email);
    cy.get('input[type=password]').type(password);
    cy.contains('Sign in').click();

    cy.url().should('match', /\/$/);
    cy.visit('/tasks');
    cy.contains('Your Tasks');
  });
});


