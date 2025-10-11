describe('Protected routes', () => {
  it('redirects unauthenticated users to /login', () => {
    cy.clearCookies();
    cy.visit('/tasks');
    cy.url().should('match', /\/login$/);
  });
});


