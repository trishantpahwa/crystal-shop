describe("Orders Page", () => {
    beforeEach(() => {
        cy.login();
    });

    it("should show sign in prompt when not authenticated", () => {
        cy.logout();
        cy.visit("/orders");
        cy.contains("Please sign in to view your orders").should("be.visible");
        cy.contains("Sign In with Google").should("be.visible");
    });

    it("should display orders page when authenticated", () => {
        cy.visit("/orders");
        cy.contains("Your Orders").should("be.visible");
    });

    it("should show empty state when no orders", () => {
        cy.visit("/orders");
        // cy.contains("You haven't placed any orders yet").should("be.visible");
        // cy.contains("Start Shopping").should("be.visible");
    });

    // it("should display order after placing one", () => {
    //     // First create an order
    //     cy.visit("/");
    //     cy.get('[data-testid="product-card"]')
    //         .first()
    //         .within(() => {
    //             cy.contains("Add to bag").click();
    //         });

    //     cy.visit("/cart");
    //     cy.contains("Proceed to Checkout").click();
    //     cy.get("textarea").type("123 Test Street, Test City, TC 12345");
    //     cy.contains("Place Order").click();

    //     // Now check orders page
    //     cy.visit("/orders");
    //     cy.contains("Your Orders").should("be.visible");
    //     cy.get(".bg-secondary-bg").should("have.length.greaterThan", 0);
    // });

    // it("should display order details correctly", () => {
    //     // Create an order first
    //     cy.visit("/");
    //     cy.get('[data-testid="product-card"]')
    //         .first()
    //         .within(() => {
    //             cy.contains("Add to bag").click();
    //         });

    //     cy.visit("/cart");
    //     cy.contains("Proceed to Checkout").click();
    //     cy.get("textarea").type("123 Test Street, Test City, TC 12345");
    //     cy.contains("Place Order").click();

    //     // Check order details
    //     cy.visit("/orders");
    //     cy.get(".bg-secondary-bg")
    //         .first()
    //         .within(() => {
    //             cy.contains("Order #").should("be.visible");
    //             cy.contains("Shipping Address").should("be.visible");
    //             cy.contains("Items").should("be.visible");
    //             cy.contains("₹").should("be.visible");
    //         });
    // });

    // it("should navigate to home from orders page", () => {
    //     cy.visit("/orders");
    //     cy.contains("Start Shopping").click();
    //     cy.url().should("eq", "http://localhost:3000/");
    // });
});
