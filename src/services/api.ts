const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '').replace(/\/$/, '');
const MAIZE_API_URL = (process.env.NEXT_PUBLIC_MAIZE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '').replace(/\/$/, '');

const parseJsonResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return await response.json();
  }

  const text = await response.text();
  return text ? { message: text } : {};
};

export interface AuthResponse {
  success: boolean;
  user: {
    id: number;
    email: string;
    phone?: string;
    name: string;
    role?: string;
  };
  token: string;
  message: string;
}

export interface ErrorResponse {
  success: boolean;
  message: string;
}

export const authService = {
  async signup(email: string, phone: string, password: string, name: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, phone, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Signup failed');
    }

    const data = await response.json();
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  async verify(token: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Token verification failed');
    }

    return await response.json();
  },

  async logout(): Promise<void> {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

export const analysisService = {
  async createChatSession(sessionName?: string) {
    const token = authService.getToken();
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_URL}/api/analysis/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create chat session');
    }

    return await response.json();
  },

  async sendMessage(
    chatSessionId: number,
    role: 'user' | 'assistant',
    content: string,
    imageUrl?: string,
    analysisResult?: string
  ) {
    const token = authService.getToken();
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_URL}/api/analysis/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatSessionId,
        role,
        content,
        imageUrl,
        analysisResult,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send message');
    }

    return await response.json();
  },

  async saveAnalysisResult(
    chatSessionId: number,
    imageUrl: string,
    imagePath: string,
    diseaseDetected: boolean,
    diseaseName: string | null,
    diseaseId: number | null,
    confidenceScore: number,
    isHealthy: boolean,
    modelVersion: string,
    modelProcessingTime: number,
    affectedAreaPercentage?: number,
    treatmentRecommendation?: string,
    urgencyLevel?: string
  ) {
    const token = authService.getToken();
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_URL}/api/analysis/save-result`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatSessionId,
        imageUrl,
        imagePath,
        diseaseDetected,
        diseaseName,
        diseaseId,
        confidenceScore,
        isHealthy,
        modelVersion,
        modelProcessingTime,
        affectedAreaPercentage,
        treatmentRecommendation,
        urgencyLevel,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to save analysis result');
    }

    return await response.json();
  },
  async getChatSessions() {
    const token = authService.getToken();
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_URL}/api/analysis/sessions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch chat sessions');
    }

    return await response.json();
  },
  async getChatMessages(chatSessionId: number) {
    const token = authService.getToken();
    if (!token) throw new Error('No token found');

    const response = await fetch(
      `${API_URL}/api/analysis/messages?chatSessionId=${chatSessionId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch chat messages');
    }

    return await response.json();
  },
};

export const diseaseService = {
  async getDiseases() {
    const token = authService.getToken();
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_URL}/api/diseases/list`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch diseases');
    }

    return await response.json();
  },

  async createDisease(
    name: string,
    cropType: string,
    scientificName?: string,
    description?: string,
    severityLevel?: string,
    symptoms?: string,
    treatmentRecommendation?: string,
    preventionMethods?: string,
    mlModelId?: number
  ) {
    const token = authService.getToken();
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_URL}/api/diseases/list`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        scientific_name: scientificName,
        description,
        severity_level: severityLevel,
        crop_type: cropType,
        symptoms,
        treatment_recommendation: treatmentRecommendation,
        prevention_methods: preventionMethods,
        ml_model_id: mlModelId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create disease');
    }

    return await response.json();
  },
};

export const fieldService = {
  async getFields() {
    const token = authService.getToken();
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_URL}/api/fields/manage`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch fields');
    }

    return await response.json();
  },

  async createField(
    fieldName: string,
    cropType: string,
    plantingDate: string,
    expectedHarvestDate?: string,
    areaAcres?: number,
    locationLatitude?: number,
    locationLongitude?: number,
    weatherPattern?: string,
    notes?: string
  ) {
    const token = authService.getToken();
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_URL}/api/fields/manage`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fieldName,
        cropType,
        plantingDate,
        expectedHarvestDate,
        areaAcres,
        locationLatitude,
        locationLongitude,
        weatherPattern,
        notes,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create field');
    }

    return await response.json();
  },
};

export const treatmentService = {
  async getTreatments() {
    const token = authService.getToken();
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_URL}/api/treatments/manage`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch treatments');
    }

    return await response.json();
  },

  async recordTreatment(
    fieldId: number,
    treatmentDate: string,
    treatmentType: string,
    quantity: number,
    unit: string,
    diseaseId?: number,
    chemicalUsed?: string,
    effectivenessRating?: number,
    notes?: string
  ) {
    const token = authService.getToken();
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_URL}/api/treatments/manage`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fieldId,
        diseaseId,
        treatmentDate,
        treatmentType,
        chemicalUsed,
        quantity,
        unit,
        effectivenessRating,
        notes,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to record treatment');
    }

    return await response.json();
  },
};

export const mlModelService = {
  async getModels() {
    const response = await fetch(`${API_URL}/api/ml-models/list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch ML models');
    }

    return await response.json();
  },

  async registerModel(
    modelName: string,
    modelVersion: string,
    modelType?: string,
    framework?: string,
    accuracyScore?: number,
    precision?: number,
    recall?: number,
    f1Score?: number,
    supportedDiseases?: string[],
    inputShape?: string
  ) {
    const response = await fetch(`${API_URL}/api/ml-models/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model_name: modelName,
        model_version: modelVersion,
        model_type: modelType,
        framework,
        accuracy_score: accuracyScore,
        precision,
        recall,
        f1_score: f1Score,
        supported_diseases: supportedDiseases,
        input_shape: inputShape,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to register ML model');
    }

    return await response.json();
  },
};

export const analyticsService = {
  async getStatistics() {
    const token = authService.getToken();
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_URL}/api/analytics/statistics`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch statistics');
    }

    return await response.json();
  },
};

export const uploadService = {
  async uploadImage(imageData: string, fileName: string, chatSessionId?: number) {
    const token = authService.getToken();
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_URL}/api/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageData,
        fileName,
        chatSessionId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload image');
    }

    return await response.json();
  },
};

export interface MaizeApiBaseResponse {
  ok: boolean;
  message?: string;
  api_version: string;
  timestamp: string;
}

export interface MaizeHealthResponse extends MaizeApiBaseResponse {
  service: string;
  status_message: string;
}

export interface MaizeModelInfoResponse extends MaizeApiBaseResponse {
  text_model?: string;
  response_map?: string;
  intent_labels?: string;
  image_model?: string;
  validation_model?: string;
  image_input_shape?: [number | null, number, number, number];
  image_classes?: number;
  text_intents?: number;
  supports?: {
    text_question?: boolean;
    json_chat?: boolean;
    multipart_image_upload?: boolean;
    json_base64_image?: boolean;
  };
}

export interface MaizePredictTextResponse extends MaizeApiBaseResponse {
  type: 'text';
  input_source?: string;
  label?: string;
  response?: string;
  model_path?: string;
}

export interface MaizePredictImageResponse extends MaizeApiBaseResponse {
  type: 'image';
  input_source?: string;
  valid_image?: boolean;
  label?: string;
  condition?: string;
  stage?: string;
  severity?: string;
  answer?: string;
  report?: string;
  model_path?: string;
  validation_model_path?: string;
  file_name?: string;
  error?: string;
  detected_objects?: string[];
}

export type MaizePredictResponse = MaizePredictTextResponse | MaizePredictImageResponse;

export interface MaizeChatResponse extends MaizeApiBaseResponse {
  response: string;
  source?: 'openai' | 'local-response-map' | 'fallback';
  label?: string;
}

export const maizeApiService = {
  async health(): Promise<MaizeHealthResponse> {
    const response = await fetch(`${API_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await parseJsonResponse(response);
    if (!response.ok || !data?.ok) {
      throw new Error(data?.error || data?.message || 'Maize API health check failed');
    }

    return data as MaizeHealthResponse;
  },

  async modelInfo(): Promise<MaizeModelInfoResponse> {
    const response = await fetch(`${API_URL}/api/model-info`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await parseJsonResponse(response);
    if (!response.ok || !data?.ok) {
      throw new Error(data?.error || data?.message || 'Failed to fetch maize API model information');
    }

    return data as MaizeModelInfoResponse;
  },

  async predict(input: { question?: string; message?: string; imageBase64?: string }): Promise<MaizePredictResponse> {
    const response = await fetch(`${API_URL}/api/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: input.question,
        message: input.message,
        image_base64: input.imageBase64,
      }),
    });

    const data = await parseJsonResponse(response);
    const isInvalidImageResponse =
      response.status === 400 &&
      data?.type === 'image' &&
      data?.valid_image === false;

    if (isInvalidImageResponse) {
      return data as MaizePredictResponse;
    }

    if (!response.ok || !data?.ok) {
      throw new Error(data?.error || data?.message || 'Prediction request failed');
    }

    return data as MaizePredictResponse;
  },

  async chat(message: string): Promise<MaizeChatResponse> {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    const data = await parseJsonResponse(response);
    if (!response.ok || !data?.ok) {
      throw new Error(data?.error || data?.message || 'Chat request failed');
    }

    return data as MaizeChatResponse;
  },
};

export const adminService = {
  async getUsers() {
    const token = authService.getToken();
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_URL}/api/admin/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to fetch users');
    }

    return await response.json();
  },

  async updateUserRole(targetUserId: number, newRole: 'admin' | 'user') {
    const token = authService.getToken();
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_URL}/api/admin/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'update-role', targetUserId, newRole }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to update user role');
    }

    return await response.json();
  },

  async deactivateUser(targetUserId: number) {
    const token = authService.getToken();
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_URL}/api/admin/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'deactivate', targetUserId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to deactivate user');
    }

    return await response.json();
  },

  async getUserSessions(targetUserId: number) {
    const token = authService.getToken();
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_URL}/api/admin/users/${targetUserId}/sessions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to fetch user sessions');
    }

    return await response.json();
  }
};
