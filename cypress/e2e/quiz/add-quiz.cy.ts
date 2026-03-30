describe('Create Quiz E2E', () => {

   beforeEach(() => {
    cy.fixture('user').then((user) => {
      cy.login(user.email, user.password);
    });
  });
  it('should open create quiz modal', () => {
    cy.get('ion-fab-button').click();
    cy.get('create-quiz-modal').should('exist');
  });


  it('should create a quiz with one question', () => {
    cy.get('ion-fab-button').click({ force: true });

    // Titre du quiz
    cy.get('ion-input.kh-title-input')
      .find('input.native-input')
      .type('X');

    // Description
    cy.get('ion-textarea.kh-description-input')
      .find('textarea').type('Description du quiz test' ,  { force: true }) ;

    // Texte de la question (déjà générée par défaut)
    cy.get('ion-input.kh-question-input')
      .first()
      .find('input.native-input')
      .clear({ force: true })
      .type('Quelle est la capitale de la France ?', { force: true });

    // Remplir les choix
    cy.get('ion-input.kh-choice-input').eq(0)
      .find('input.native-input').clear({ force: true }).type('Paris' ,  { force: true });
    cy.get('ion-input.kh-choice-input').eq(1)
      .find('input.native-input').clear({ force: true }).type('Londres', { force: true });
    cy.get('ion-input.kh-choice-input').eq(2)
      .find('input.native-input').clear({ force: true }).type('Berlin', { force: true });
    cy.get('ion-input.kh-choice-input').eq(3)
      .find('input.native-input').clear({ force: true }).type('Madrid', { force: true });

    // Sélectionner la bonne réponse (Paris = index 0)
    cy.get('ion-radio.kh-radio').first().click({ force: true })

    // Sauvegarder
    cy.get('[data-testid="confirm-create-quiz-button"]').click({ force: true });

    // Vérifier que le modal est fermé et le quiz apparaît
    cy.get('create-quiz-modal').should('not.exist');
    cy.get('quiz-card .kh-quiz-title', { timeout: 10000 }).should('contain', 'Guess the Capital CityX');
  });

  it('should add a question', () => {
    cy.get('ion-fab-button').click({ force: true });

    // Titre obligatoire
    cy.get('ion-input.kh-title-input')
      .find('input.native-input').type('Quiz avec plusieurs questions', { force: true });

    // Ajouter une question
    cy.get('button.kh-add-question-btn').click({ force: true });;

    // Vérifier qu'une 2ème question apparaît
    cy.get('ion-input.kh-question-input').should('have.length.greaterThan', 1);
  });

  it('should remove a question', () => {
    cy.get('ion-fab-button').click({ force: true });

    cy.get('ion-input.kh-title-input')
      .find('input.native-input').type('Quiz test suppression', { force: true });

    // Ajouter une question
    cy.get('button.kh-add-question-btn').click({ force: true });
    cy.get('ion-input.kh-question-input').should('have.length', 2);

    // Supprimer la 2ème question
    cy.get('button.kh-remove-question-btn').last().click({ force: true });
    cy.get('ion-input.kh-question-input').should('have.length', 1);
  });

  it('should add a choice to a question', () => {
    cy.get('ion-fab-button').click({ force: true });

    // Compter les choix de base (4 par défaut)
    cy.get('ion-input.kh-choice-input').should('have.length', 4);

    // Ajouter un choix
    cy.get('button.kh-add-choice-btn').first().click({ force: true });
    cy.get('ion-input.kh-choice-input').should('have.length', 5);
  });

  it('should cancel and not save', () => {
    cy.get('ion-fab-button').click({ force: true });

    cy.get('ion-input.kh-title-input')
      .find('input.native-input').type('Quiz annulé', { force: true });

    // Annuler
    cy.get('[data-testid="cancel-create-quiz-button"]').click({ force: true });

    // Vérifier que le modal est fermé
    cy.get('create-quiz-modal').should('not.exist');

    // Vérifier que le quiz n'a pas été créé
    cy.get('quiz-card').should('not.contain', 'Quiz annulé');
  });

});