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

    it("should update order status", async () => {
        cy.visit("/admin/orders");

        // Find an order and update its status
        const orderElement = cy.get(".flex > .rounded-lg").first();

        orderElement.invoke("val").then((val) => {
            // Remove the orderElementValue from the array
            var orderStatusValues = [
                "PENDING",
                "SHIPPED",
                "DELIVERED",
                "CONFIRMED",
                "CANCELLED",
            ].filter((status) => status !== val);
            const newStatus =
                orderStatusValues[
                    Math.floor(Math.random() * orderStatusValues.length)
                ];
            orderElement.find("select").first().select(newStatus);
            cy.contains("Order status updated").should("be.visible");
        });
    });

    it("should display admin products page", () => {
        cy.visit("/admin/products");
        cy.contains("Product management");
    });

    it("should navigate between admin sections", () => {
        cy.visit("/admin/orders");
        cy.contains("Products").click();
        cy.url().should("include", "/admin/products");

        cy.contains("Orders").click();
        cy.url().should("include", "/admin/orders");
    });

    it("should create a new product", () => {
        cy.visit("/admin/products");

        // Fill out the product creation form
        cy.get('input[placeholder="Name"]').type("Test Crystal Ring");
        cy.get('input[placeholder="Price (string)"]').clear().type("2999");
        cy.get('input[placeholder="Subtitle"]').type(
            "A beautiful test crystal ring"
        );
        cy.get("select").eq(0).select("amethyst"); // Tone select
        cy.get('input[placeholder="Tag (optional)"]').type("test");
        cy.get("select").eq(1).select("rings"); // Category select

        // Upload an image using a data URL for a minimal PNG
        cy.get('input[type="file"]').selectFile(
            "cypress/fixtures/image2.webp",
            {
                force: true,
            }
        );
        // Submit the form
        cy.wait(5000);
        cy.get(":nth-child(2) > .justify-between > .flex > .inline-flex")
            .should("be.visible")
            .and("be.enabled")
            .click();

        // Check for success message
        cy.contains("Product created").should("be.visible");
    });

    it("should edit an existing product", () => {
        cy.visit("/admin/products");
        // Find the first product and click edit
        cy.contains("Edit").first().click();
        // Update the product name
        cy.get('input[placeholder="Name"]')
            .clear()
            .type("Updated Test Crystal Ring");
        // Submit the form
        cy.contains("Save").should("be.enabled").click();
        // List should not contain the old name
        cy.contains("Updated Test Crystal Ring").should("be.visible");
    });

    it("should delete a product", () => {
        cy.visit("/admin/products");
        // Find the first product and click delete
        cy.contains("Delete").first().click();
        // Confirm deletion from window.confirm
        cy.window().then((win) => {
            cy.stub(win, "confirm").returns(true);
        });
        // Check for success message
        cy.contains("Product deleted").should("be.visible");
        cy.contains("Test Crystal Ring").should("not.exist");
    });
    // it("should logout from admin panel", () => {
    //     cy.visit("/admin/orders");
    //     cy.contains("Logout").click();
    //     cy.url().should("include", "/admin/login");
    // });

    // it("should redirect to login when not authenticated", () => {
    //     cy.adminLogout();
    //     cy.visit("/admin/orders");
    //     cy.url().should("include", "/admin/login");
    // });
});
