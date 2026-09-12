import { fromNodeMiddleware } from "h3";
import expressApp from "#server/backend/express_app";

export default fromNodeMiddleware(expressApp);
