describe("Home Page", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    it("should load the home page correctly", () => {
        cy.contains("Crystal jewellerycrafted to glow — day and night.").should(
            "be.visible"
        );
        cy.contains("Hand-finished • Ethically sourced").should("be.visible");
        cy.contains("Shop featured").should("be.visible");
        cy.contains("Explore categories").should("be.visible");
    });

    it("should display hero section with proper content", () => {
        cy.get("h1").should("contain", "Crystal jewellery");
        cy.get("h1").should("contain", "crafted to glow — day and night");
        cy.contains(
            "A calm, luxurious collection of crystal rings, pendants and earrings."
        ).should("be.visible");

        // Check stats
        cy.contains("4.9").should("be.visible");
        cy.contains("Avg rating").should("be.visible");
        cy.contains("24h").should("be.visible");
        cy.contains("Dispatch").should("be.visible");
        cy.contains("30d").should("be.visible");
        cy.contains("Returns").should("be.visible");
    });

    it("should display featured products section", () => {
        cy.contains("Featured").should("be.visible");
        cy.contains("Signature pieces, designed to shimmer").should(
            "be.visible"
        );
        cy.contains("View all").should("be.visible");

        // Check if products are loaded
        cy.get('[data-testid="product-card"]').should(
            "have.length.greaterThan",
            0
        );
    });

    it("should display categories section", () => {
        cy.contains("Shop").should("be.visible");
        cy.contains("Browse by category").should("be.visible");
        cy.contains("Rings").should("be.visible");
        cy.contains("Necklaces").should("be.visible");
        cy.contains("Earrings").should("be.visible");
        cy.contains("Bracelets").should("be.visible");
    });

    it("should display features section", () => {
        cy.contains("Promise").should("be.visible");
        cy.contains("Luxury feel, thoughtful details").should("be.visible");
        cy.contains("Authentic crystals").should("be.visible");
        cy.contains("Secure & hypoallergenic").should("be.visible");
        cy.contains("Fast dispatch").should("be.visible");
        cy.contains("Low-waste packaging").should("be.visible");
    });

    it("should display testimonials section", () => {
        cy.contains("Loved").should("be.visible");
        cy.contains("Real reviews, real sparkle").should("be.visible");
        cy.contains("4.9 average").should("be.visible");
    });

    it("should display newsletter section", () => {
        cy.contains("Newsletter").should("be.visible");
        cy.contains("Get first access to new drops").should("be.visible");
        cy.get('input[type="email"]').should("be.visible");
        cy.contains("Subscribe").should("be.visible");
    });

    it("should display footer with proper links", () => {
        cy.contains("Crystal Atelier").should("be.visible");
        cy.contains("Modern crystal jewellery").should("be.visible");
        cy.contains("Shop").should("be.visible");
        cy.contains("Company").should("be.visible");
        cy.contains("Support").should("be.visible");
    });

    it("should navigate to products page from View all button", () => {
        cy.contains("View all").click();
        cy.url().should("include", "/products");
    });

    it("should navigate to products page with category filter", () => {
        cy.contains("Rings").click();
        cy.url().should("include", "/products?category=rings");
    });

    it("should handle newsletter subscription", () => {
        cy.get('input[type="email"]').type("test@example.com");
        cy.contains("Subscribe").click();
        cy.contains("Subscribed successfully!").should("be.visible");
    });

    it("should add an item to the cart from the product listing", () => {
        cy.login();
        cy.reload();

        // Click on first product card's "Add to bag" button
        cy.get('[data-testid="product-card"]')
            .first()
            .within(() => {
                cy.contains("Add to bag").click();
            });

        // Check if cart count updated
        cy.contains("Bag (1)").should("be.visible");

        // Navigate to cart
        cy.contains("Bag (1)").click();
        cy.url().should("include", "/cart");

        // Verify item is in cart
        cy.contains("Your Cart").should("be.visible");
        cy.get(".bg-secondary-bg").should("have.length.greaterThan", 1);
    });

    it("should complete full purchase flow", () => {
        cy.login();
        cy.reload();

        // Add item to cart
        cy.get('[data-testid="product-card"]')
            .first()
            .within(() => {
                cy.contains("Add to bag").click();
            });

        // Go to cart
        cy.contains("Bag (1)").click();

        // Proceed to checkout
        cy.contains("Proceed to Checkout").click();

        // Enter address and place order
        cy.get("textarea").type("123 Main St, Springfield, USA");
        cy.contains("Place Order").click();

        // Should redirect to orders page
        cy.url().should("include", "/orders");
        cy.contains("Your Orders").should("be.visible");
    });
});
