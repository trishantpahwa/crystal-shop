describe("Navigation and UI", () => {
    it("should navigate between main pages", () => {
        // Home to Products
        cy.visit("/");
        cy.contains("View all").click();
        cy.url().should("include", "/products");

        // Products back to Home
        cy.contains("Back to home").click();
        cy.url().should("eq", "http://localhost:3000/");

        // Home to Cart (when authenticated)
        cy.login();
        cy.reload();
        cy.contains("Bag").click();
        cy.url().should("include", "/cart");

        // Cart back to Home
        cy.contains("Continue Shopping").click();
        cy.url().should("eq", "http://localhost:3000/");
    });

    it("should handle header navigation", () => {
        cy.visit("/");
        cy.get("header").should("be.visible");

        // Logo should link to home
        cy.get("header").contains("Crystal Atelier").click();
        cy.url().should("eq", "http://localhost:3000/");
    });

    it("should display loading states", () => {
        cy.visit("/products");
        // Products should load
        cy.get('[data-testid="product-card"]').should(
            "have.length.greaterThan",
            0
        );
    });

    it("should handle responsive design", () => {
        cy.visit("/");

        // Check mobile viewport
        cy.viewport("iphone-6");
        cy.contains("Crystal Atelier").should("be.visible");

        // Check desktop viewport
        cy.viewport("macbook-15");
        cy.contains("Crystal Atelier").should("be.visible");
    });

    it("should display error states gracefully", () => {
        // Visit non-existent product
        cy.visit("/product/non-existent-slug");
        cy.contains("Product not found").should("be.visible");
    });

    it("should handle search functionality", () => {
        cy.visit("/");
        // Search button should be visible (though not functional in this demo)
        cy.contains("Search").should("be.visible");
    });

    it("should display footer links", () => {
        cy.visit("/");
        cy.contains("Rings").should("be.visible");
        cy.contains("Necklaces").should("be.visible");
        cy.contains("Earrings").should("be.visible");
        cy.contains("About").should("be.visible");
        cy.contains("Contact").should("be.visible");
    });

    it("should handle browser back/forward", () => {
        cy.visit("/");
        cy.contains("View all").click();
        cy.url().should("include", "/products");

        cy.go("back");
        cy.url().should("eq", "http://localhost:3000/");

        cy.go("forward");
        cy.url().should("include", "/products");
    });
});
