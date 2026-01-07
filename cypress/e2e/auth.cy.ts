describe("Authentication Flows", () => {
    it("should handle user login flow", () => {
        cy.visit("/");

        // Mock login
        cy.login();
        cy.reload();

        // Should show cart button instead of sign in
        cy.contains("Bag").should("be.visible");
        cy.contains("Sign In").should("not.exist");
    });

    // it("should handle user logout", () => {
    //     cy.login();
    //     cy.visit("/");
    //     cy.contains("Bag").should("be.visible");

    //     // Logout
    //     cy.logout();
    //     cy.reload();

    //     // Should show sign in button again
    //     cy.contains("Sign In").should("be.visible");
    //     cy.contains("Bag").should("not.exist");
    // });

    it("should handle admin login", () => {
        cy.visit("/admin/login");

        cy.get('input[id="username"]').type(Cypress.env("ADMIN_USERNAME"));
        cy.get('input[id="password"]').type(Cypress.env("ADMIN_PASSWORD"));
        cy.get('button[type="submit"]').click();

        cy.url().should("include", "/admin/orders");
        cy.contains("Order Management").should("be.visible");
    });

    it("should handle admin login failure", () => {
        cy.visit("/admin/login");

        cy.get('input[id="username"]').type("wrong");
        cy.get('input[id="password"]').type("wrong");
        cy.get('button[type="submit"]').click();

        cy.contains("Invalid credentials").should("be.visible");
    });

    it("should protect admin routes", () => {
        cy.visit("/admin/orders");
        cy.url().should("include", "/admin/login");

        cy.visit("/admin/products");
        cy.url().should("include", "/admin/login");
    });

    it("should protect user routes when not authenticated", () => {
        cy.visit("/cart");
        cy.contains("Please sign in").should("be.visible");

        cy.visit("/orders");
        cy.contains("Please sign in").should("be.visible");
    });

    it("should maintain authentication state across page reloads", () => {
        cy.login();
        cy.visit("/");
        cy.contains("Bag").should("be.visible");

        cy.reload();
        cy.contains("Bag").should("be.visible");
    });

    it("should maintain admin authentication state", () => {
        cy.adminLogin();
        cy.visit("/admin/orders");
        cy.contains("Order Management").should("be.visible");

        cy.reload();
        cy.contains("Order Management").should("be.visible");
    });

    after(() => {
        // Cleanup: logout after tests
        cy.logout();
        cy.adminLogout();
    });
});
