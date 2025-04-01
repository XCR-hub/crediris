export class AFIESCAError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AFIESCAError';
  }

  static fromErrorCode(code: string): AFIESCAError {
    const errorMessages: Record<string, string> = {
      'AUTH_ERROR': 'Erreur d\'authentification AFI ESCA',
      'INVALID_DATA': 'Les données fournies sont invalides',
      'SIMULATION_FAILED': 'La simulation a échoué',
      'COVERAGE_ERROR': 'Les garanties sélectionnées sont invalides',
      'SERVICE_UNAVAILABLE': 'Service AFI ESCA indisponible',
      'NETWORK_ERROR': 'Erreur réseau',
      'HEALTH_RISK': 'Risque santé détecté',
      'VALIDATION_ERROR': 'Erreur de validation',
      'DEFAULT': 'Une erreur est survenue'
    };

    return new AFIESCAError(
      errorMessages[code] || errorMessages.DEFAULT,
      code
    );
  }

  static fromResponse(response: any): AFIESCAError {
    if (response.ErrorCode) {
      return new AFIESCAError(
        response.ErrorDescription || 'Erreur AFI ESCA',
        response.ErrorCode,
        response
      );
    }
    return new AFIESCAError('Erreur inattendue');
  }
}

export function translateAFIError(error: AFIESCAError): string {
  const translations: Record<string, string> = {
    'AUTH_ERROR': 'Impossible de se connecter à AFI ESCA. Veuillez réessayer.',
    'INVALID_DATA': 'Les données fournies sont invalides. Veuillez vérifier votre saisie.',
    'SIMULATION_FAILED': 'La simulation a échoué. Veuillez réessayer.',
    'COVERAGE_ERROR': 'Les garanties sélectionnées sont invalides ou incompatibles.',
    'SERVICE_UNAVAILABLE': 'Le service AFI ESCA est temporairement indisponible.',
    'NETWORK_ERROR': 'Erreur de connexion. Veuillez vérifier votre connexion internet.',
    'HEALTH_RISK': 'Des risques de santé ont été détectés. Un examen complémentaire pourrait être nécessaire.',
    'VALIDATION_ERROR': 'Certaines données sont invalides. Veuillez les vérifier.',
    'DEFAULT': 'Une erreur est survenue. Veuillez réessayer.'
  };

  return translations[error.code || 'DEFAULT'] || translations.DEFAULT;
}