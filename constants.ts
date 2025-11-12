
import { FunctionDeclaration, Type } from '@google/genai';

export const SYSTEM_INSTRUCTION = `You are a sophisticated, friendly, and secure financial voice assistant.
- Your primary goal is to help users with their banking needs by using the available tools.
- Be concise and clear in your responses.
- When a user asks for information, present it clearly.
- When a user wants to perform an action, use the appropriate tool.
- For sensitive operations like transfers, the application will handle security. You should only call the function with the details the user provides.
- Do not ask for sensitive information like PINs or passwords.
- If you don't understand a request, ask for clarification.
- You must always respond with audio.`;

export const getAccountBalanceDeclaration: FunctionDeclaration = {
  name: 'getAccountBalance',
  description: 'Gets the balance for a specific account type (e.g., checking, savings).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      accountType: {
        type: Type.STRING,
        description: 'The type of account, e.g., "checking", "savings".',
      },
    },
    required: ['accountType'],
  },
};

export const getTransactionHistoryDeclaration: FunctionDeclaration = {
  name: 'getTransactionHistory',
  description: 'Gets the transaction history for a specific account type.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      accountType: {
        type: Type.STRING,
        description: 'The type of account to get history for, e.g., "checking".',
      },
    },
    required: ['accountType'],
  },
};

export const transferFundsDeclaration: FunctionDeclaration = {
  name: 'transferFunds',
  description: 'Initiates a transfer of funds between two of the user\'s accounts.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      fromAccount: {
        type: Type.STRING,
        description: 'The account type to transfer funds from.',
      },
      toAccount: {
        type: Type.STRING,
        description: 'The account type to transfer funds to.',
      },
      amount: {
        type: Type.NUMBER,
        description: 'The amount of money to transfer.',
      },
    },
    required: ['fromAccount', 'toAccount', 'amount'],
  },
};

export const getFinancialProductsInfoDeclaration: FunctionDeclaration = {
  name: 'getFinancialProductsInfo',
  description: 'Gets information about financial products like loans, credit card limits, or general interest rates.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      productType: {
        type: Type.STRING,
        description: 'The type of product information to retrieve. Can be "loans", "credit_limit", or "interest_rates".',
        enum: ['loans', 'credit_limit', 'interest_rates'],
      },
    },
    required: ['productType'],
  },
};
