declare module "@paypal/checkout-server-sdk" {
  namespace core {
    class PayPalHttpClient {
      constructor(environment: SandboxEnvironment | LiveEnvironment);
      execute(request: PayPalRequest): Promise<any>;
    }

    class SandboxEnvironment {
      constructor(clientId: string, clientSecret: string);
    }

    class LiveEnvironment {
      constructor(clientId: string, clientSecret: string);
    }
  }

  interface PayPalRequest {
    requestBody(body: any): void;
  }

  namespace orders {
    class OrdersCreateRequest implements PayPalRequest {
      constructor();
      requestBody(body: any): void;
    }

    class OrdersCaptureRequest implements PayPalRequest {
      constructor(orderId: string);
      requestBody(body: any): void;
    }

    class OrdersGetRequest implements PayPalRequest {
      constructor(orderId: string);
      requestBody(body: any): void;
    }
  }

  namespace payments {
    class CapturesRefundRequest implements PayPalRequest {
      constructor(transactionId: string);
      requestBody(body: any): void;
    }

    class CapturesGetRequest implements PayPalRequest {
      constructor(captureId: string);
      requestBody(body: any): void;
    }
  }
}
