@echo off
REM ======================================================
REM Modüler Mimari Klasör Yapısı Oluşturma Scripti
REM ======================================================

REM Ana proje klasörlerini oluştur
mkdir backend
mkdir backend\api
mkdir backend\config
mkdir backend\core
mkdir backend\features
mkdir backend\infrastructure
mkdir backend\integration
mkdir backend\monitoring
mkdir backend\security
mkdir backend\shared
mkdir backend\tests
mkdir backend\deployment
mkdir backend\docs
mkdir backend\scripts

REM API (Presentation) Katmanı
cd backend\api
mkdir controllers
mkdir middleware
mkdir validators
cd ..\..

REM Core (Domain) Katmanı
cd backend\core
mkdir bpmn
mkdir bpmn\engine
mkdir bpmn\parsers
mkdir bpmn\validators

mkdir workflow
mkdir workflow\engine
mkdir workflow\states
mkdir workflow\transitions

mkdir forms
mkdir forms\builder
mkdir forms\validators
mkdir forms\renderers

mkdir rules
mkdir rules\engine
mkdir rules\conditions
mkdir rules\actions

mkdir integrations
mkdir integrations\adapters
mkdir integrations\connectors

mkdir scheduler
mkdir scheduler\jobs
mkdir scheduler\triggers
cd ..\..

REM Features (Business Logic) Katmanı
cd backend\features
REM Auth Feature
mkdir auth
mkdir auth\controllers
mkdir auth\services
mkdir auth\models
mkdir auth\middleware
mkdir auth\validators
mkdir auth\types

REM Processes Feature
mkdir processes
mkdir processes\controllers
mkdir processes\services
mkdir processes\models
mkdir processes\validators
mkdir processes\types
mkdir processes\utils

REM Tasks Feature
mkdir tasks
mkdir tasks\controllers
mkdir tasks\services
mkdir tasks\models
mkdir tasks\validators
mkdir tasks\types

REM Forms Feature
mkdir forms
mkdir forms\controllers
mkdir forms\services
mkdir forms\models
mkdir forms\validators

REM Reports Feature
mkdir reports
mkdir reports\controllers
mkdir reports\services
mkdir reports\generators
mkdir reports\templates

REM Notifications Feature
mkdir notifications
mkdir notifications\controllers
mkdir notifications\services
mkdir notifications\templates
mkdir notifications\channels

cd ..\..

REM Infrastructure Katmanı
cd backend\infrastructure
mkdir database
mkdir database\mongodb
mkdir database\mongodb\connections
mkdir database\mongodb\migrations
mkdir database\redis

mkdir storage
mkdir storage\local
mkdir storage\cloud

mkdir cache
mkdir cache\providers
mkdir cache\strategies

mkdir queue
mkdir queue\providers
mkdir queue\consumers

mkdir messaging
mkdir messaging\kafka
mkdir messaging\rabbitmq
mkdir messaging\websocket

mkdir search
mkdir search\elasticsearch
mkdir search\indices
cd ..\..

REM Integration Katmanı
cd backend\integration
mkdir email
mkdir email\providers
mkdir email\templates

mkdir notification
mkdir notification\providers
mkdir notification\templates

mkdir payment
mkdir payment\providers

mkdir external-apis
mkdir external-apis\connectors
mkdir external-apis\adapters
cd ..\..

REM Monitoring Katmanı
cd backend\monitoring
mkdir logging
mkdir logging\providers
mkdir logging\formatters

mkdir metrics
mkdir metrics\collectors
mkdir metrics\exporters

mkdir analytics
mkdir analytics\processors
mkdir analytics\reporters

mkdir alerts
mkdir alerts\triggers
mkdir alerts\notifiers
cd ..\..

REM Security Katmanı
cd backend\security
mkdir encryption
mkdir encryption\providers
mkdir encryption\keys

mkdir authentication
mkdir authentication\strategies
mkdir authentication\providers

mkdir authorization
mkdir authorization\policies
mkdir authorization\roles

mkdir audit
mkdir audit\loggers
mkdir audit\reporters

mkdir rate-limiting
mkdir rate-limiting\strategies
mkdir rate-limiting\configs

mkdir cors
mkdir cors\policies
cd ..\..

REM Shared Katmanı
cd backend\shared
mkdir constants

mkdir utils
mkdir utils\formatters
mkdir utils\validators
mkdir utils\helpers

mkdir types
mkdir types\models
mkdir types\dtos

mkdir errors
mkdir errors\handlers
mkdir errors\types

mkdir interfaces
mkdir interfaces\repositories
mkdir interfaces\services
mkdir interfaces\controllers

mkdir decorators
mkdir decorators\validation
mkdir decorators\logging
mkdir decorators\cache
cd ..\..

REM Tests Katmanı
cd backend\tests
mkdir unit
mkdir integration
mkdir e2e
mkdir performance
cd ..\..

REM Deployment Katmanı
cd backend\deployment
mkdir docker
mkdir kubernetes
mkdir scripts
cd ..\..

REM Docs Katmanı
cd backend\docs
mkdir api
mkdir architecture
mkdir guides
cd ..\..

REM Scripts Katmanı
cd backend\scripts
mkdir migration
mkdir seeding
mkdir backup
cd ..\..

echo.
echo Tüm klasörler başarıyla oluşturuldu.
echo.
pause
