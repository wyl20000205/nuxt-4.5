import { fromNodeMiddleware } from "h3";
import expressApp from "#server/yumao/express_app";

export default fromNodeMiddleware(expressApp);
