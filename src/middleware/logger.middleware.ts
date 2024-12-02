import { Request, Response, NextFunction } from "express";
import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import {requestBodyLog, HttpUrlLog, responseBodyLog} from '../config/winstonLog'
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl, body, headers } = request;
    const userAgent = request.get("user-agent") || "";
    let transactionId = Date.now();
    // Extract transaction ID from Bearer token
    
    request['transactionid_for_log'] = transactionId
    requestBodyLog({...body, transactionid_for_log: transactionId})

     // Intercept response data
     const originalSend = response.send; // Save the original `send` method
     let responseData: any;
 
     response.send = function (data: any): Response {
       responseData = data; // Capture the response data
       return originalSend.call(this, data); // Call the original `send` method
     };

    response.on("finish", () => {
      const { statusCode } = response;
      const contentLength = response.get("content-length")
      try {
        responseData = JSON.parse(responseData)
      } catch(e) {
        responseData = {}
      }

      responseBodyLog({...responseData, transactionid_for_log: transactionId, transaction_id: responseData['TransactionId'] || null}) //TransactionId
      // HttpUrlLog(`${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`, transactionId, responseData['TransactionId'])
      HttpUrlLog(`${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`)
    });
    next();
  }
}