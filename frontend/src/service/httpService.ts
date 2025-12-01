const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Validate BASE_URL is set
if (!process.env.NEXT_PUBLIC_API_URL) {
  console.warn('⚠️ NEXT_PUBLIC_API_URL is not set. Using default: http://localhost:8000/api');
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  meta?: any;
}

interface RequestOptions {
  headers?: Record<string, string>;
}

class HttpService {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private getHeaders(auth: boolean = true): Record<string, string> {
    if (auth) {
      return this.getAuthHeaders();
    }
    return { "Content-Type": "application/json" };
  }

  private async makeRequest<T = any>(
    endPoint: string,
    method: string,
    body?: any,
    auth: boolean = true,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    try {
        const url = `${BASE_URL}${endPoint}`;
        const headers = {
            ...this.getHeaders(auth),
            ...options?.headers
        }

        const config : RequestInit= {
            method,
            headers,
            ...(body && {body: JSON.stringify(body)})
        }

        const response = await fetch(url, config);
        
        // Get content type to determine how to parse response
        const contentType = response.headers.get("content-type") || "";
        const isJson = contentType.includes("application/json");
        
        // Check if response is OK before parsing
        if(!response.ok) {
          // Read response as text first (can be parsed as JSON later if needed)
          const responseText = await response.text();
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          
          // Try to parse as JSON if content-type suggests it, otherwise use text
          if (isJson) {
            try {
              const errorData = JSON.parse(responseText);
              errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (parseError) {
              // If JSON parsing fails, use text response
              errorMessage = responseText || errorMessage;
            }
          } else {
            errorMessage = responseText || errorMessage;
          }
          
          throw new Error(errorMessage);
        }
        
        // For successful responses, ensure we have JSON
        if (!isJson) {
          const text = await response.text();
          throw new Error(`Expected JSON response but received ${contentType || 'unknown content type'}. Response: ${text.substring(0, 100)}`);
        }
        
        const data : ApiResponse <T> = await response.json();
        return data;
    } catch (error:any) {
        console.error(`Api Error [${method} ${endPoint} ]:`, error)
        console.log(error)
        throw error;
    }
  }

  //Method with authentication
  async getWithAuth<T = any > (endPoint:string,options?:RequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endPoint,'GET',null, true, options)
  }


    async postWithAuth<T = any > (endPoint:string,body:any,options?:RequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endPoint,'POST',body, true, options)
  }

      async putWithAuth<T = any > (endPoint:string,body:any,options?:RequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endPoint,'PUT',body, true, options)
  }

    async deleteWithAuth<T = any > (endPoint:string,options?:RequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endPoint,'DELETE',null, true, options)
  }


      async postWithoutAuth<T = any > (endPoint:string,body:any,options?:RequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endPoint,'POST',body, false, options)
  }

        async getWithoutAuth<T = any > (endPoint:string,options?:RequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endPoint,'GET',null, false, options)
  }
}





//Export the singleton instance
export const httpService = new HttpService();



//bind create a new function where this is permanently set to the instance of HttpService

export const getWithAuth = httpService.getWithAuth.bind(httpService);
export const postWithAuth = httpService.postWithAuth.bind(httpService);
export const putWithAuth = httpService.putWithAuth.bind(httpService);
export const deleteWithAuth = httpService.deleteWithAuth.bind(httpService);

export const postWithoutAuth = httpService.postWithoutAuth.bind(httpService);
export const getWithoutAuth = httpService.getWithoutAuth.bind(httpService);