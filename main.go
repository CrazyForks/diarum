package main

import (
	"log"

	"github.com/songtianlun/diaria/internal/api"
	_ "github.com/songtianlun/diaria/internal/migrations"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
)

func main() {
	app := pocketbase.New()

	// Register migrations
	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		Automigrate: true, // Auto-run migrations on startup
	})

	// Register custom routes
	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		api.RegisterDiaryRoutes(app, e)
		return nil
	})

	// Start the application
	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
