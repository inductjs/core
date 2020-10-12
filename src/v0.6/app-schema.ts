import { mongoose } from "@typegoose/typegoose";
import Knex from "knex";

export interface ApplicationOpts {
    /** Connection object to your database.
     *
     * This connection is assigned to each loaded controller at runtime,
     * and serves as the default connection if none is set in the configuration of individual controllers.
     */
    db: mongoose.Connection | Knex;
    /** Path to a folder that includes InductController files, from the root of the application.
     *
     * Setting this option enables controller auto-loading
     *
     * Default: src/controllers */
    controllerFolder?: string;
    /** Port number the server should run on.
     *
     * Default: 3000 */
    port?: number;
    /** Root namespace of the api. Prepends all the controller base paths
     *
     * Default: api
    */
    rootNamespace?: string;
    /** Enables a set of security middleware and configuration
     *
     * Default: false
     */
    securityEssentials?: boolean;
    /** Adds basic role based access control (user/admin).
     *
     * If set, allows the authz: {role} option in controllers and routes
     *
     * Default: false
     *  */
    simpleRbac?: boolean;
    /** Adds an authentication method to the application the.
     *
     * If set, allows the authn: {type} option in controllers and routes
     *
     * Default: false
     * */
    authentication?: Array<"basic" | "JWT" | {oauth: "discord" | "google" | "facebook" | "twitter"}>;
    /** Enables serving of a single index.html file for Single Page Applications
     *
     * Default: false
    */
    serveSPA?: boolean;
}

