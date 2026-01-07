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
        cy.wait(1000); // Wait for products to load
        // Click on All to reset - this should either remove the category or set it to empty
        cy.get(".flex-wrap > :nth-child(1)").click();
        // The URL might still have category= or might not, depending on implementation
        cy.get(".flex-wrap > :nth-child(1)").should(
            "have.class",
            "bg-accent-bg"
        ); // Should be selected
    });

    it("should navigate to product detail page", () => {
        cy.get('[data-testid="product-card"]').first().click();
        cy.url().should("include", "/product/");
    });

    it("should navigate back to home", () => {
        cy.contains("Back to home").click();
        cy.url().should("eq", "http://localhost:3000/");
    });

    // it("should show cart button when authenticated", () => {
    //     cy.login();
    //     cy.reload();
    //     cy.contains(/Bag\(\d+\)/).should("be.visible");
    // });
});
