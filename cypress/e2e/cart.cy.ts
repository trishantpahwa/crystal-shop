describe("Cart Functionality", () => {
    beforeEach(() => {
        cy.login();
    });

    it("should show empty cart when no items", () => {
        cy.visit("/cart");
        cy.contains("Your cart is empty").should("be.visible");
        cy.contains("Continue Shopping").should("be.visible");
    });

    it("should add items to cart", () => {
        // Add item from home page
        cy.visit("/");
        cy.get('[data-testid="product-card"]')
            .first()
            .within(() => {
                cy.contains("Add to bag").click();
            });

        // Check cart count
        cy.contains("Bag (1)").should("be.visible");

        // Visit cart
        cy.visit("/cart");
        cy.contains("Your Cart").should("be.visible");
        cy.get(".bg-secondary-bg").should("have.length.greaterThan", 1); // Cart items
    });

    it("should update item quantity", () => {
        // Add item to cart
        cy.visit("/");
        cy.get('[data-testid="product-card"]')
            .first()
            .within(() => {
                cy.contains("Add to bag").click();
            });

        cy.visit("/cart");

        // Increase quantity
        cy.get("button").contains("+").first().click();
        cy.contains("2").should("be.visible");

        // Decrease quantity
        cy.get("button").contains("-").first().click();
        cy.contains("1").should("be.visible");
    });

    it("should remove items from cart", () => {
        // Add item to cart
        cy.visit("/");
        cy.get('[data-testid="product-card"]')
            .first()
            .within(() => {
                cy.contains("Add to bag").click();
            });

        cy.visit("/cart");

        // Remove item
        cy.contains("Remove").click();
        cy.contains("Your cart is empty").should("be.visible");
    });

    it("should calculate total correctly", () => {
        // Add multiple items
        cy.visit("/");
        cy.get('[data-testid="product-card"]')
            .first()
            .within(() => {
                cy.contains("Add to bag").click();
            });

        cy.visit("/cart");

        // Check that total is displayed
        cy.contains("Total").should("be.visible");
        cy.contains("₹").should("be.visible");
    });

    it("should proceed to checkout", () => {
        // Add item to cart
        cy.visit("/");
        cy.get('[data-testid="product-card"]')
            .first()
            .within(() => {
                cy.contains("Add to bag").click();
            });

        cy.visit("/cart");

        // Proceed to checkout
        cy.contains("Proceed to Checkout").click();
        cy.contains("Checkout").should("be.visible");
        cy.get("textarea").should("be.visible");
        cy.contains("Place Order").should("be.visible");
    });

    it("should complete checkout process", () => {
        // Add item to cart
        cy.visit("/");
        cy.get('[data-testid="product-card"]')
            .first()
            .within(() => {
                cy.contains("Add to bag").click();
            });

        cy.visit("/cart");

        // Proceed to checkout
        cy.contains("Proceed to Checkout").click();

        // Enter shipping address
        cy.get("textarea").type("123 Test Street, Test City, TC 12345");

        // Place order
        cy.contains("Place Order").click();

        // Should redirect to orders page
        cy.url().should("include", "/orders");
        cy.contains("Your Orders").should("be.visible");
    });

    it("should require shipping address for checkout", () => {
        // Add item to cart
        cy.visit("/");
        cy.get('[data-testid="product-card"]')
            .first()
            .within(() => {
                cy.contains("Add to bag").click();
            });

        cy.visit("/cart");

        // Proceed to checkout
        cy.contains("Proceed to Checkout").click();

        // Try to place order without address
        cy.contains("Place Order").should("be.disabled");
    });

    it("should show sign in prompt when not authenticated", () => {
        cy.logout();
        cy.visit("/cart");
        cy.contains("Please sign in to view your cart").should("be.visible");
        cy.contains("Sign In with Google").should("be.visible");
    });
});
