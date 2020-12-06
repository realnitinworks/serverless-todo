import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import Axios from 'axios'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'


const logger = createLogger('auth');
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = "https://dev-3--4mypu.us.auth0.com/.well-known/jwks.json";


export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken);
   
  try {
    const jwtPayload: JwtPayload = await verifyToken(event.authorizationToken)
    logger.info('User was authorized');

    return {
      principalId: jwtPayload.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  }
  catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}


async function getCertificate() {
  const response = await Axios.get(jwksUrl);
  const startLine: string = "-----BEGIN CERTIFICATE-----\n";
  const endLine: string = "\n-----END CERTIFICATE-----";
  return `${startLine}${response.data.keys[0]["x5c"][0]}${endLine}`;  
}


async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const cert = await getCertificate();
  logger.info("Certificate", {
    cert
  });
  
  return verify(
    token,
    cert,
    { algorithms: ['RS256'] }
  ) as JwtPayload;
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  return authHeader.split(' ')[1];
}
