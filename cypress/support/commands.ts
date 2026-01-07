/// <reference types="cypress" />

// Custom commands for authentication and common actions
Cypress.Commands.add("login", () => {
    const mockUserSecret = Cypress.env("MOCK_USER_SECRET");
    cy.request({
        method: "GET",
        url: "http://localhost:3000/api/mock-login",
        headers: {
            "x-mock-user-secret": mockUserSecret,
        },
    }).then((response) => {
        expect(response.status).to.eq(200);
        const jwt = response.body.token;
        cy.window().then((win) => {
            win.localStorage.setItem("token", jwt);
            win.localStorage.setItem("refreshToken", jwt);
        });
    });
});

Cypress.Commands.add("logout", () => {
    cy.window().then((win) => {
        win.localStorage.removeItem("token");
        win.localStorage.removeItem("refreshToken");
    });
});
Cypress.Commands.add(
    "adminLogin",
    (
        username = Cypress.env("ADMIN_USERNAME"),
        password = Cypress.env("ADMIN_PASSWORD")
    ) => {
        cy.request({
            method: "POST",
            url: "http://localhost:3000/api/admin/login",
            body: { username, password },
        }).then((response) => {
            expect(response.status).to.eq(200);
            const token = response.body.token;
            cy.window().then((win) => {
                win.localStorage.setItem("adminToken", token);
            });
        });
    }
);

Cypress.Commands.add("adminLogout", () => {
    cy.window().then((win) => {
        win.localStorage.removeItem("adminToken");
    });
});

declare global {
    namespace Cypress {
        interface Chainable {
            login(): Chainable<void>;
            logout(): Chainable<void>;
            adminLogin(username?: string, password?: string): Chainable<void>;
            adminLogout(): Chainable<void>;
        }
    }
}

