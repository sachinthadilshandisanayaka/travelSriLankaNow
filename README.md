# Travel Sri Lanka Now - Backend API

Spring Boot REST API for the Travel Sri Lanka Now application.

## Technologies

- Java 17
- Spring Boot 4.0.0
- Spring Data JPA
- PostgreSQL
- Lombok
- Maven

## Prerequisites

- JDK 17 or higher
- Maven 3.6+
- PostgreSQL 12 or higher

## Database Setup

1. Install PostgreSQL if not already installed
2. Create a new database:
```sql
CREATE DATABASE travel_srilanka_db;
```

3. Update database credentials in `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/travel_srilanka_db
spring.datasource.username=your_username
spring.datasource.password=your_password
```

## Installation & Running

1. Clone the repository
2. Navigate to the backend directory:
```bash
cd traveSriLankaNowBE
```

3. Install dependencies and build:
```bash
mvn clean install
```

4. Run the application:
```bash
mvn spring-boot:run
```

The API will start on `http://localhost:8080`

## API Endpoints

### Locations
- `GET /api/locations` - Get all locations
- `GET /api/locations/{id}` - Get location by ID
- `GET /api/locations/featured` - Get featured locations
- `GET /api/locations/category/{category}` - Get locations by category (beach, mountain, cultural, wildlife, city)
- `GET /api/locations/region/{region}` - Get locations by region (north, south, east, west, central)
- `GET /api/locations/search?q={query}` - Search locations

### Places
- `GET /api/places` - Get all places
- `GET /api/places/{id}` - Get place by ID
- `GET /api/places/featured` - Get featured places
- `GET /api/places/type/{type}` - Get places by type (hotel, restaurant, cafe, guesthouse, resort)
- `GET /api/places/region/{region}` - Get places by region
- `GET /api/places/search?q={query}` - Search places

### Events
- `GET /api/events` - Get all events
- `GET /api/events/{id}` - Get event by ID
- `GET /api/events/featured` - Get featured events
- `GET /api/events/category/{category}` - Get events by category (cultural, adventure, food, festival, tour)
- `GET /api/events/search?q={query}` - Search events

### Gallery
- `GET /api/gallery` - Get all gallery items
- `GET /api/gallery/{id}` - Get gallery item by ID
- `GET /api/gallery/featured` - Get featured gallery items
- `GET /api/gallery/category/{category}` - Get gallery items by category
- `GET /api/gallery/search?q={query}` - Search gallery items

### Bookings
- `POST /api/events/book` - Create a new event booking
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/{id}` - Get booking by ID
- `GET /api/bookings/email/{email}` - Get bookings by email
- `GET /api/bookings/event/{eventId}` - Get bookings for an event
- `PATCH /api/bookings/{id}/status?status={status}` - Update booking status

## Database Schema

The application uses the following main entities:
- **Location** - Tourist destinations
- **Place** - Hotels, restaurants, cafes, etc.
- **Event** - Tours and activities
- **EventDate** - Specific dates for events
- **GalleryItem** - Photos and videos
- **EventBooking** - Event reservations

## Sample Data

The application comes with sample data that will be automatically loaded on startup. You can find the SQL scripts in `src/main/resources/data.sql`.

## CORS Configuration

CORS is configured to allow requests from `http://localhost:4200` (Angular frontend). To modify this, edit `src/main/java/com/travesrilankanow/travesrilankanowbe/config/CorsConfig.java`.

## Error Handling

The API includes global exception handling that returns standardized error responses:
- 404 - Resource Not Found
- 400 - Bad Request (validation errors)
- 500 - Internal Server Error

## Project Structure

```
src/main/java/com/travesrilankanow/travesrilankanowbe/
├── config/          # Configuration classes (CORS)
├── controller/      # REST controllers
├── dto/            # Data Transfer Objects
├── entity/         # JPA entities
├── exception/      # Exception handling
├── repository/     # JPA repositories
└── service/        # Business logic layer
```

## Development

To run in development mode with auto-reload:
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

## Building for Production

```bash
mvn clean package
java -jar target/traveSriLankaNowBE-0.0.1-SNAPSHOT.jar
```

## Testing

The backend includes comprehensive service and repository layers. The sample data in `data.sql` can be used for testing all endpoints.

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify database credentials in `application.properties`
- Check that the database `travel_srilanka_db` exists

### Port Already in Use
- Change the port in `application.properties`:
```properties
server.port=8081
```

### CORS Issues
- Verify the Angular app URL in `CorsConfig.java`
- Ensure the frontend is running on the configured port
