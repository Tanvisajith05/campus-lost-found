describe("Campus Lost & Found - Automated Testing", () => {

  // =====================================================
  // TC01 - FUNCTIONAL TESTING
  // Application should load successfully
  // =====================================================
  it("TC01 - Application should load successfully", () => {

    cy.visit("/");

    cy.wait(2000);

    cy.contains("Welcome back")
      .should("be.visible");

    cy.wait(1500);

    cy.contains("Sign in to continue to your campus space.")
      .should("be.visible");

    cy.wait(2000);
  });


  // =====================================================
  // TC02 - NEGATIVE TESTING
  // Invalid login should be rejected
  // =====================================================
  it("TC02 - Invalid login should be rejected", () => {

    cy.visit("/login");

    cy.wait(2000);

    cy.get('[data-testid="email-input"]')
      .type("wrong@example.com");

    cy.wait(1500);

    cy.get('[data-testid="password-input"]')
      .type("wrongpassword");

    cy.wait(1500);

    cy.get('[data-testid="login-button"]')
      .click();

    cy.wait(2500);

    cy.get(".alert-danger")
      .should("be.visible");

    cy.wait(2000);
  });


  // =====================================================
  // TC03 - FUNCTIONAL TESTING
  // Admin login
  // =====================================================
  it("TC03 - Admin should login successfully", () => {

    cy.visit("/login");

    cy.wait(2000);

    cy.get('[data-testid="email-input"]')
      .type("admin@campus.local");

    cy.wait(1500);

    cy.get('[data-testid="password-input"]')
      .type("Admin@12345");

    cy.wait(1500);

    cy.get('[data-testid="login-button"]')
      .click();

    cy.wait(3000);

    cy.url()
      .should("include", "/admin");

    cy.wait(1500);

    cy.contains("Operations dashboard")
      .should("be.visible");

    cy.wait(2000);
  });


  // =====================================================
  // TC04 - FUNCTIONAL TESTING
  // Search for an item
  // =====================================================
  it("TC04 - User should be able to search for an item", () => {

    cy.visit("/login");

    cy.wait(1500);

    cy.get('[data-testid="email-input"]')
      .type("admin@campus.local");

    cy.wait(1500);

    cy.get('[data-testid="password-input"]')
      .type("Admin@12345");

    cy.wait(1500);

    cy.get('[data-testid="login-button"]')
      .click();

    cy.wait(3000);

    cy.visit("/projects");

    cy.wait(2500);

    cy.contains("Campus reports")
      .should("be.visible");

    cy.wait(1500);

    cy.get('input[placeholder="Search item..."]')
      .should("be.visible")
      .type("spiderman");

    cy.wait(2000);

    cy.contains("Search")
      .should("be.visible")
      .click();

    cy.wait(2500);

    cy.contains("spiderman keychain")
      .should("be.visible");

    cy.wait(2000);
  });


  // =====================================================
  // TC05 - NEGATIVE TESTING
  // Invalid report submission should be rejected
  // =====================================================
  it("TC05 - Invalid report submission should be rejected", () => {

    cy.visit("/login");

    cy.wait(1500);

    cy.get('[data-testid="email-input"]')
      .type("admin@campus.local");

    cy.wait(1500);

    cy.get('[data-testid="password-input"]')
      .type("Admin@12345");

    cy.wait(1500);

    cy.get('[data-testid="login-button"]')
      .click();

    cy.wait(3000);

    cy.visit("/report/LOST");

    cy.wait(2500);

    cy.get('[data-testid="submit-report"]')
      .should("be.visible");

    cy.wait(1500);

    cy.get('[data-testid="submit-report"]')
      .click();

    cy.wait(2000);

    // Required fields prevent the empty form
    // from being submitted.
    cy.url()
      .should("include", "/report/LOST");

    cy.wait(2000);
  });


  // =====================================================
  // TC06 - FUNCTIONAL TESTING
  // Admin dashboard statistics
  // =====================================================
  it("TC06 - Admin dashboard statistics should be displayed", () => {

    cy.visit("/login");

    cy.wait(1500);

    cy.get('[data-testid="email-input"]')
      .type("admin@campus.local");

    cy.wait(1500);

    cy.get('[data-testid="password-input"]')
      .type("Admin@12345");

    cy.wait(1500);

    cy.get('[data-testid="login-button"]')
      .click();

    cy.wait(3000);

    cy.url()
      .should("include", "/admin");

    cy.wait(1500);

    cy.contains("Operations dashboard")
      .should("be.visible");

    cy.wait(1500);

    cy.contains("Reports")
      .should("be.visible");

    cy.wait(1000);

    cy.contains("Lost")
      .should("be.visible");

    cy.wait(1000);

    cy.contains("Found")
      .should("be.visible");

    cy.wait(2000);
  });


  // =====================================================
  // TC07 - INTEGRATION TESTING
  // High-confidence match
  // =====================================================
  it("TC07 - Admin should see high-confidence match", () => {

    cy.visit("/login");

    cy.wait(1500);

    cy.get('[data-testid="email-input"]')
      .type("admin@campus.local");

    cy.wait(1500);

    cy.get('[data-testid="password-input"]')
      .type("Admin@12345");

    cy.wait(1500);

    cy.get('[data-testid="login-button"]')
      .click();

    cy.wait(3000);

    cy.contains("Operations dashboard")
      .should("be.visible");

    cy.wait(1500);

    cy.contains("High-Confidence Matches")
      .should("be.visible");

    cy.wait(1500);

    cy.contains("spiderman keychain")
      .should("be.visible");

    cy.wait(1500);

    cy.contains("100%")
      .should("be.visible");

    cy.wait(2500);
  });


  // =====================================================
  // TC08 - FUNCTIONAL TESTING
  // Confirm high-confidence match
  // =====================================================
  it("TC08 - Admin should confirm high-confidence match", () => {

    cy.visit("/login");

    cy.wait(1500);

    cy.get('[data-testid="email-input"]')
      .type("admin@campus.local");

    cy.wait(1500);

    cy.get('[data-testid="password-input"]')
      .type("Admin@12345");

    cy.wait(1500);

    cy.get('[data-testid="login-button"]')
      .click();

    cy.wait(3000);

    cy.contains("High-Confidence Matches")
      .should("be.visible");

    cy.wait(2000);

    cy.contains("Confirm Match")
      .should("be.visible");

    cy.wait(1500);

    cy.contains("Confirm Match")
      .click();

    cy.wait(3000);

    cy.contains("Mark Both Returned")
      .should("be.visible");

    cy.wait(2500);
  });


  // =====================================================
  // TC09 - INTEGRATION TESTING
  // Mark matched items as returned
  // =====================================================
  it("TC09 - Admin should mark matched items as returned", () => {

    cy.visit("/login");

    cy.wait(1500);

    cy.get('[data-testid="email-input"]')
      .type("admin@campus.local");

    cy.wait(1500);

    cy.get('[data-testid="password-input"]')
      .type("Admin@12345");

    cy.wait(1500);

    cy.get('[data-testid="login-button"]')
      .click();

    cy.wait(3000);

    cy.contains("High-Confidence Matches")
      .should("be.visible");

    cy.wait(2000);

    cy.contains("Mark Both Returned")
      .should("be.visible");

    cy.wait(1500);

    cy.contains("Mark Both Returned")
      .click();

    cy.wait(3000);

    cy.contains("Returned")
      .should("be.visible");

    cy.wait(2500);
  });


  // =====================================================
  // TC10 - NEGATIVE TESTING
  // Returned item should not appear in available listings
  // =====================================================
  it("TC10 - Returned item should not appear in available listings", () => {

    cy.visit("/login");

    cy.wait(1500);

    cy.get('[data-testid="email-input"]')
      .type("admin@campus.local");

    cy.wait(1500);

    cy.get('[data-testid="password-input"]')
      .type("Admin@12345");

    cy.wait(1500);

    cy.get('[data-testid="login-button"]')
      .click();

    cy.wait(3000);

    cy.visit("/projects");

    cy.wait(2500);

    cy.contains("Campus reports")
      .should("be.visible");

    cy.wait(1500);

    cy.contains("spiderman keychain")
      .should("not.exist");

    cy.wait(2500);
  });

});