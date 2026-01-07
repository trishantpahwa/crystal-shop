describe("Product Detail Page", () => {
    let productLink = "";

    before(() => {
        // First visit products page to get a product slug
        cy.visit("/products");
        cy.get('[data-testid="product-card"]')
            .first()
            .find("a")
            .invoke("attr", "href")
            .then((href) => {
                productLink = href;
            });
    });

    it("should load product detail page", () => {
        cy.visit(productLink);
        cy.contains("Back to home").should("be.visible");
        cy.get("h1").should("be.visible");
    });

    it("should display product information", () => {
        cy.visit(productLink);
        cy.get("h1").should("be.visible"); // Product name
        cy.contains("Price").should("be.visible");
        cy.contains("Tone").should("be.visible");
        cy.contains("Add to bag").should("be.visible");
    });

    it("should display product images", () => {
        cy.visit(productLink);
        cy.get("img").should("be.visible");
    });

    it("should show sign in prompt when adding to cart without authentication", () => {
        cy.visit(productLink);
        cy.contains("Add to bag").click();
        cy.contains("Please sign in to add to cart").should("be.visible");
    });

    it("should add product to cart when authenticated", () => {
        cy.login();
        cy.visit(productLink);
        cy.contains("Add to bag").click();
        cy.contains("added to cart").should("be.visible");
    });

    it("should navigate back to home", () => {
        cy.visit(productLink);
        cy.contains("Back to home").click();
        cy.url().should("eq", "http://localhost:3000/");
    });

    it("should display product stats", () => {
        cy.visit(productLink);
        cy.contains("4.9").should("be.visible");
        cy.contains("Avg rating").should("be.visible");
        cy.contains("24h").should("be.visible");
        cy.contains("Dispatch").should("be.visible");
        cy.contains("30d").should("be.visible");
        cy.contains("Returns").should("be.visible");
    });
});
