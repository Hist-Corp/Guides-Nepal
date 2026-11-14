import 'vitest';
import { type TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare module 'vitest' {
  interface Assertion<T = unknown> extends TestingLibraryMatchers<unknown, T> {
    // biome-ignore lint/suspicious/noExplicitAny: extending jest-dom matchers
    toBeInTheDocument(): this;
    toHaveTextContent(text: string | RegExp): this;
    toHaveAttribute(name: string, value?: string): this;
    toHaveClass(...classNames: string[]): this;
    toBeVisible(): this;
    toBeDisabled(): this;
    toBeEnabled(): this;
    toBeChecked(): this;
    toHaveValue(value: string | string[] | number): this;
    toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): this;
  }
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers<unknown, unknown> {
    // biome-ignore lint/suspicious/noExplicitAny: extending jest-dom matchers
    toBeInTheDocument(): this;
    toHaveTextContent(text: string | RegExp): this;
    toHaveAttribute(name: string, value?: string): this;
    toHaveClass(...classNames: string[]): this;
    toBeVisible(): this;
    toBeDisabled(): this;
    toBeEnabled(): this;
    toBeChecked(): this;
    toHaveValue(value: string | string[] | number): this;
    toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): this;
  }
}
