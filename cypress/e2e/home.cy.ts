describe("Home Page", () => {
    it("should load the home page", () => {
        cy.visit("/");
        cy.contains("Crystal jewellerycrafted to glow — day and night.");
    });
    it("should add an item to the cart from the product listing", async () => {
        // Get env variable example
        const mockUserSecret = Cypress.env("MOCK_USER_SECRET");
        const response = await cy.request({
            method: "GET",
            url: "http://localhost:3000/api/mock-login",
            headers: {
                "x-mock-user-secret": mockUserSecret,
            },
        });
        const jwt = response.body.token;

        cy.visit("/", {
            onBeforeLoad(win) {
                win.localStorage.setItem("token", jwt);
                win.localStorage.setItem("refreshToken", jwt);
            },
        });
        cy.reload();

        cy.get(":nth-child(1) > .pt-0 > .w-full").click();

        cy.get(".gap-2 > .inline-flex").click();

        cy.contains("Proceed to Checkout").should("be.visible");

        cy.get(".inline-flex").contains("Proceed to Checkout").click();

        // // Enter address in text field
        cy.get(".space-y-4 > :nth-child(1) > .w-full").type(
            "123 Main St, Springfield, USA"
        );
        cy.contains("Place Order").should("be.visible");
        cy.contains("Place Order").click();
    });
});
