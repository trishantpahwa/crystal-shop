describe("Home Page", () => {
    it("should load the home page", () => {
        cy.visit("/");
        cy.contains("Crystal jewellerycrafted to glow — day and night.");
    });
});
