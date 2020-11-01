import { Responses } from "../../../../app/responses"
import { RequestVersion } from "../../../../app/type"

export const endpointVersion = "0.1.0"
export const responses = new Responses(new RequestVersion(endpointVersion))
