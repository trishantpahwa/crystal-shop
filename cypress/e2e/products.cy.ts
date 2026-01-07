describe("Products Page", () => {
    beforeEach(() => {
        cy.visit("/products");
    });

    it("should load the products page correctly", () => {
        cy.contains("All Products").should("be.visible");
        cy.contains("Every piece, every crystal").should("be.visible");
        cy.contains("Back to home").should("be.visible");
    });

    it("should display products", () => {
        cy.get('[data-testid="product-card"]').should(
            "have.length.greaterThan",
            0
        );
    });

    it("should filter products by category", () => {
        // Click on Rings category
        cy.contains("Rings").click();
        cy.url().should("include", "category=rings");

        // Click on All to reset - this should either remove the category or set it to empty
        cy.contains("All").click();
        // The URL might still have category= or might not, depending on implementation
        cy.contains("All").should("have.class", "bg-accent-bg"); // Should be selected
    });

    it("should navigate to product detail page", () => {
        cy.get('[data-testid="product-card"]').first().click();
        cy.url().should("include", "/product/");
    });

    it("should navigate back to home", () => {
        cy.contains("Back to home").click();
        cy.url().should("eq", "http://localhost:3000/");
    });

    it("should show sign in button when not authenticated", () => {
        cy.contains("Sign In").should("be.visible");
    });

    it("should show cart button when authenticated", () => {
        cy.login();
        cy.reload();
        cy.contains("Bag").should("be.visible");
    });
});
