from typing import Generator
import typing
import requests
import json
import time
from limits import storage, strategies, parse

memory_storage = storage.MemoryStorage()
moving_window = strategies.MovingWindowRateLimiter(memory_storage)
one_per_second = parse("25/second")

SECONDS_PER_DAY = 86400
DAYS_PER_WEEK = 7

BASE_URL = 'https://universalis.app/api/v2/'

def main():
    print(current_milli_time())
    print(past_week_milli_time())
    with open("items.json", encoding="utf-8") as f:
        diadochos = filter((ItemName(x, **y) for x, y in json.load(f).items()), "diadochos", "augmented")
    ids = [x.id for x in diadochos]
    itemResponse: ItemResponse = get_history(ids, 'materia')
    for item in itemResponse.items.values():
        itemSaleVolume = 0
        itemSaleQuantity = 0
        for entry in item.entries:
            itemSaleVolume += entry.pricePerUnit * entry.quantity
            itemSaleQuantity += entry.quantity
        itemName = [x for x in diadochos if x.id == item.itemID][0].name
        print(itemName)
        print(item.regularSaleVelocity)
        print(itemSaleVolume / itemSaleQuantity)

    return

class Entry():
    def __init__(
            self,
            hq: bool,
            pricePerUnit: int,
            quantity: int,
            buyerName: str,
            onMannequin: bool,
            timestamp: int,
            worldName: str,
            worldID: int):
        self.hq = hq
        self.pricePerUnit = pricePerUnit
        self.quantity = quantity
        self.buyerName = buyerName
        self.onMannequin = onMannequin
        self.timestamp = timestamp
        self.worldName = worldName
        self.worldID = worldID


class Item():
    def __init__(self,  data: dict[str, typing.Any]):
        self.itemID = data["itemID"]
        self.lastUploadTime = data["lastUploadTime"]
        self.entries = [Entry(**x) for x in data["entries"]]
        self.dcName = data["dcName"]
        self.regularSaleVelocity = data["regularSaleVelocity"]
        self.nqSaleVelocity = data["nqSaleVelocity"]
        self.hqSaleVelocity = data["hqSaleVelocity"]


class ItemResponse():
    def __init__(self, data: dict[str, typing.Any]):
        self.itemIDs = data["itemIDs"]
        self.items: dict[str, Item] = {x: Item(y) for x, y in data["items"].items()}
        self.dcName = data["dcName"]
        self.unresolvedItems = data["unresolvedItems"]


class ItemName():
    def __init__(self, id: str, en: str, de: str, ja: str, fr: str):
        self.id = int(id)
        self.name = en


def get_history(ids: list[int], worldOrDc: str) -> ItemResponse:
    if len(ids) > 100:
        raise ValueError('Cannot fetch more than 100 items at a time')
    idString = ','.join(str(x) for x in ids)
    route = f'history/{worldOrDc}/{idString}'
    while not moving_window.test(one_per_second, "global_namespace", "foo"):
        time.sleep(0.01)
    assert True == moving_window.hit(one_per_second, "global_namespace", "foo")
    r = requests.get(BASE_URL + route)
    if len(ids) == 1:
        item: Item = json.loads(r.text, object_hook=lambda d: Item(d))
        return ItemResponse(ids, {str(item.itemID): item}, dcName=item.dcName, unresolvedItems=[])
    else:
        return ItemResponse(json.loads(r.text))


def current_milli_time():
    return round(time.time() * 1000)


def past_week_milli_time():
    return round((time.time() - (SECONDS_PER_DAY * DAYS_PER_WEEK)) * 1000)


def filter(items: Generator[ItemName, None, None], whitelist: str = None, blacklist: str = None) -> list[ItemName]:
    white = [] if whitelist is None else whitelist.split()
    black = [] if blacklist is None else blacklist.split()
    return [x for x in items if all(s.lower() in x.name.lower() for s in white) and not any(s.lower() in x.name.lower() for s in black)]

if __name__ == "__main__":
    main()