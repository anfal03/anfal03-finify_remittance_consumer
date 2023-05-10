import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AgentService } from './agent.service';
import {
  CreateAgentDto,
  OffnetWithdrawalDto,
  SendUSSDDto
} from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { AuthmodeAuthGuard } from '../auth/authmode-auth.guard';

@Controller('transfer')
export class AgentController {
  constructor(private readonly agentbankingService: AgentService) {}

  // @Post('/deposit')
  // deposit(@Body() createAgentbankingDto: CreateAgentDto) {
  //   return this.agentbankingService.create(createAgentbankingDto);
  // }
  // @Post('/withdraw')
  // withdraw(@Body() createAgentbankingDto: CreateAgentDto) {
  //   return this.agentbankingService.create(createAgentbankingDto);
  // }
  // @Post('/billpay')
  // billpay(@Body() createAgentbankingDto: CreateAgentDto) {
  //   return this.agentbankingService.create(createAgentbankingDto);
  // }
  // @Post('/offnetwithdraw')
  // offnet(@Body() offnetWithdrawakDto: OffnetWithdrawalDto) {
  //   return this.agentbankingService.create(offnetWithdrawakDto);
  // }
  // @Post('/offnetwithdrawwithregistration')
  // offnetregistration(@Body() createAgentbankingDto: CreateAgentDto) {
  //   return this.agentbankingService.create(createAgentbankingDto);
  // }
  @UseGuards(AuthmodeAuthGuard)
  @Post('/send')
  async Send(@Body() sendUSSDDto: SendUSSDDto){
    return this.agentbankingService.sendService(sendUSSDDto);
  }
}
