import { AwsSdkSigV4AuthInputConfig, AwsSdkSigV4AuthResolvedConfig, AwsSdkSigV4PreviouslyResolved } from "@aws-sdk/core";
import { HandlerExecutionContext, HttpAuthScheme, HttpAuthSchemeParameters, HttpAuthSchemeParametersProvider, HttpAuthSchemeProvider } from "@smithy/types";
import { SageMakerClientResolvedConfig } from "../SageMakerClient";
/**
 * @internal
 */
export interface SageMakerHttpAuthSchemeParameters extends HttpAuthSchemeParameters {
    region?: string;
}
/**
 * @internal
 */
export interface SageMakerHttpAuthSchemeParametersProvider extends HttpAuthSchemeParametersProvider<SageMakerClientResolvedConfig, HandlerExecutionContext, SageMakerHttpAuthSchemeParameters, object> {
}
/**
 * @internal
 */
export declare const defaultSageMakerHttpAuthSchemeParametersProvider: (config: SageMakerClientResolvedConfig, context: HandlerExecutionContext, input: object) => Promise<SageMakerHttpAuthSchemeParameters>;
/**
 * @internal
 */
export interface SageMakerHttpAuthSchemeProvider extends HttpAuthSchemeProvider<SageMakerHttpAuthSchemeParameters> {
}
/**
 * @internal
 */
export declare const defaultSageMakerHttpAuthSchemeProvider: SageMakerHttpAuthSchemeProvider;
/**
 * @internal
 */
export interface HttpAuthSchemeInputConfig extends AwsSdkSigV4AuthInputConfig {
    /**
     * Configuration of HttpAuthSchemes for a client which provides default identity providers and signers per auth scheme.
     * @internal
     */
    httpAuthSchemes?: HttpAuthScheme[];
    /**
     * Configuration of an HttpAuthSchemeProvider for a client which resolves which HttpAuthScheme to use.
     * @internal
     */
    httpAuthSchemeProvider?: SageMakerHttpAuthSchemeProvider;
}
/**
 * @internal
 */
export interface HttpAuthSchemeResolvedConfig extends AwsSdkSigV4AuthResolvedConfig {
    /**
     * Configuration of HttpAuthSchemes for a client which provides default identity providers and signers per auth scheme.
     * @internal
     */
    readonly httpAuthSchemes: HttpAuthScheme[];
    /**
     * Configuration of an HttpAuthSchemeProvider for a client which resolves which HttpAuthScheme to use.
     * @internal
     */
    readonly httpAuthSchemeProvider: SageMakerHttpAuthSchemeProvider;
}
/**
 * @internal
 */
export declare const resolveHttpAuthSchemeConfig: <T>(config: T & HttpAuthSchemeInputConfig & AwsSdkSigV4PreviouslyResolved) => T & HttpAuthSchemeResolvedConfig;
