from abc import ABC, abstractmethod


class Polygon(ABC):
    @abstractmethod
    def numofsides(self):
        pass


class Triangle(Polygon):
    def numofsides(self):
        print("3")


class Hexagon(Polygon):
    def numofsides(self):
        print("6")


class Arbitrary:
    def numofsides(self):
        print("hehehe")


if __name__ == "__main__":
    polygons = [Triangle(), Hexagon(), Arbitrary()]
    for polygon in polygons:
        polygon.numofsides()
