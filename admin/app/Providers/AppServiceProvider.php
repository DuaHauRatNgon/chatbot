<?php

namespace App\Providers;
// use Illuminate\Notifications\Notification;
use Illuminate\Support\ServiceProvider;
use App\Models\MongoMusic;
use App\Observers\MongoMusicObserver;
use App\Models\MongoPodcast;
use App\Observers\MongoPodcastObserver;
use Illuminate\Notifications\DatabaseNotification as BaseNotification;
use App\Models\Notification as CustomNotification;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
        MongoMusic::observe(MongoMusicObserver::class);
        MongoPodcast::observe(MongoPodcastObserver::class);
        // DatabaseNotification::useDatabaseModel(Notification::class);
        $this->app->bind(BaseNotification::class, CustomNotification::class);

    }
}
