describe("Admin Functionality", () => {
    beforeEach(() => {
        cy.adminLogin();
    });

    it("should login to admin panel", () => {
        cy.visit("/admin/login");
        cy.adminLogin();
        cy.visit("/admin/orders");
        cy.contains("Order Management").should("be.visible");
    });

    it("should display admin orders page", () => {
        cy.visit("/admin/orders");
        cy.contains("Order Management").should("be.visible");
        cy.contains("Total Orders").should("be.visible");
        cy.contains("Total Revenue").should("be.visible");
        cy.contains("Pending Orders").should("be.visible");
    });

    it("should filter orders by status", () => {
        cy.visit("/admin/orders");

        // Select different status filters
        cy.get("select").first().select("PENDING");
        cy.url().should("include", "status=PENDING");

        cy.get("select").first().select("all");
        cy.url().should("not.include", "status");
    });

    it("should update order status", () => {
        cy.visit("/admin/orders");

        // Find an order and update its status
        cy.get("select").first().select("CONFIRMED");
        cy.contains("Order status updated").should("be.visible");
    });

    it("should display admin products page", () => {
        cy.visit("/admin/products");
        cy.contains("Product Management").should("be.visible");
    });

    it("should navigate between admin sections", () => {
        cy.visit("/admin/orders");
        cy.contains("Products").click();
        cy.url().should("include", "/admin/products");

        cy.contains("Orders").click();
        cy.url().should("include", "/admin/orders");
    });

    it("should logout from admin panel", () => {
        cy.visit("/admin/orders");
        cy.contains("Logout").click();
        cy.url().should("include", "/admin/login");
    });

    it("should redirect to login when not authenticated", () => {
        cy.adminLogout();
        cy.visit("/admin/orders");
        cy.url().should("include", "/admin/login");
    });

    it("should display order details in admin view", () => {
        // First create an order as user
        cy.login();
        cy.visit("/");
        cy.get('[data-testid="product-card"]')
            .first()
            .within(() => {
                cy.contains("Add to bag").click();
            });
        cy.visit("/cart");
        cy.contains("Proceed to Checkout").click();
        cy.get("textarea").type("123 Admin Test St, Admin City");
        cy.contains("Place Order").click();

        // Now check as admin
        cy.adminLogin();
        cy.visit("/admin/orders");
        cy.get(".bg-secondary-bg")
            .first()
            .within(() => {
                cy.contains("Order #").should("be.visible");
                cy.contains("Customer:").should("be.visible");
                cy.contains("Shipping Address").should("be.visible");
                cy.contains("Items").should("be.visible");
            });
    });
});
