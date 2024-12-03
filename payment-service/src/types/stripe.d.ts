declare module "stripe" {
  interface Stripe {
    customers: {
      create(params: {
        email: string;
        name?: string;
        [key: string]: any;
      }): Promise<Customer>;

      retrieve(customerId: string): Promise<Customer>;
    };

    charges: {
      create(params: {
        amount: number;
        currency: string;
        source: string; // Token or payment method ID
        description?: string;
        [key: string]: any;
      }): Promise<Charge>;
    };
  }

  interface Customer {
    id: string;
    email: string;
    name?: string;
    [key: string]: any;
  }

  interface Charge {
    id: string;
    amount: number;
    currency: string;
    status: string;
    [key: string]: any;
  }
}
