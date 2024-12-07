import {Body, Controller, Delete, Get, Param, Patch, Post} from '@nestjs/common';
import {ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags} from '@nestjs/swagger';
import {ClientsService} from './clients.service';
import {CreateClientDto} from './dto/create-client.dto';
import {UpdateClientDto} from './dto/update-client.dto';

@ApiTags('clients')
@Controller('clients')
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) {
    }

    @Post()
    @ApiOperation({summary: 'Create a new client'})
    @ApiResponse({status: 201, description: 'The client has been successfully created.'})
    @ApiResponse({status: 400, description: 'Bad Request.'})
    @ApiBody({type: CreateClientDto})
    create(@Body() createClientDto: CreateClientDto) {
        return this.clientsService.create(createClientDto);
    }

    @Get()
    @ApiOperation({summary: 'Get all clients'})
    @ApiResponse({status: 200, description: 'Return all clients.'})
    findAll() {
        return this.clientsService.findAll();
    }

    @Get(':id')
    @ApiOperation({summary: 'Get a client by ID'})
    @ApiResponse({status: 200, description: 'Return the client.'})
    @ApiResponse({status: 404, description: 'Client not found.'})
    @ApiParam({name: 'id', required: true, description: 'Client ID'})
    findOne(@Param('id') id: string) {
        return this.clientsService.findOne(+id);
    }

    @Patch(':id')
    @ApiOperation({summary: 'Update a client by ID'})
    @ApiResponse({status: 200, description: 'The client has been successfully updated.'})
    @ApiResponse({status: 404, description: 'Client not found.'})
    @ApiBody({type: UpdateClientDto})
    @ApiParam({name: 'id', required: true, description: 'Client ID'})
    update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
        return this.clientsService.update(+id, updateClientDto);
    }

    @Delete(':id')
    @ApiOperation({summary: 'Delete a client by ID'})
    @ApiResponse({status: 200, description: 'The client has been successfully deleted.'})
    @ApiResponse({status: 404, description: 'Client not found.'})
    @ApiParam({name: 'id', required: true, description: 'Client ID'})
    remove(@Param('id') id: string) {
        return this.clientsService.remove(+id);
    }
}
